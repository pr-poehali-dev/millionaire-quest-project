import json
import os
import urllib.request
import re
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send quiz results via Telegram
    Args: event with httpMethod, body containing userName, email, resultsText
          context with request_id
    Returns: HTTP response with success status
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_name = body_data.get('userName', 'Неизвестный')
        user_email = body_data.get('email', '')
        results_text = body_data.get('resultsText', '')
        
        print(f'[DEBUG] Received data for user: {user_name}')
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
        
        print(f'[DEBUG] Bot token exists: {bool(bot_token)}')
        print(f'[DEBUG] Chat ID exists: {bool(chat_id)}')
        
        if not bot_token or not chat_id:
            print('[WARNING] Telegram not configured - missing token or chat_id')
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': 'Результаты сохранены (Telegram не настроен)'
                })
            }
        
        score_match = re.search(r'Правильных ответов с первой попытки: (\d+)/(\d+)', results_text)
        attempts_match = re.search(r'Всего попыток: (\d+)', results_text)
        hints_match = re.search(r'Использовано подсказок: (\d+)/3', results_text)
        
        score = score_match.group(1) if score_match else '?'
        total = score_match.group(2) if score_match else '?'
        attempts = attempts_match.group(1) if attempts_match else '?'
        hints = hints_match.group(1) if hints_match else '?'
        
        percentage = int((int(score) / int(total)) * 100) if score != '?' and total != '?' else 0
        
        if percentage >= 80:
            result_emoji = '🏆'
            grade = 'Отлично!'
        elif percentage >= 60:
            result_emoji = '🎯'
            grade = 'Хорошо!'
        elif percentage >= 40:
            result_emoji = '📊'
            grade = 'Удовлетворительно'
        else:
            result_emoji = '📝'
            grade = 'Нужно подтянуть'
        
        header = f"""╔══════════════════════════
║ {result_emoji} *РЕЗУЛЬТАТЫ КВИЗА*
║ {grade}
╚══════════════════════════

👤 *Студент:* {user_name}
📧 *Email:* {user_email if user_email else 'не указан'}

━━━━━━━━━━━━━━━━━━━━━
📊 *СТАТИСТИКА*
━━━━━━━━━━━━━━━━━━━━━

✅ *С первой попытки:* {score}/{total} ({percentage}%)
🔄 *Всего попыток:* {attempts}
💡 *Использовано подсказок:* {hints}/3

━━━━━━━━━━━━━━━━━━━━━
📋 *ДЕТАЛИ ПО ВОПРОСАМ*
━━━━━━━━━━━━━━━━━━━━━
"""
        
        details_section = re.search(r'Детальные результаты:(.*)', results_text, re.DOTALL)
        if details_section:
            details = details_section.group(1).strip()
            
            formatted_details = ""
            question_blocks = re.split(r'\n\s*\n', details)
            
            for idx, block in enumerate(question_blocks, 1):
                if not block.strip():
                    continue
                    
                lines = [line.strip() for line in block.split('\n') if line.strip()]
                if len(lines) < 3:
                    continue
                
                question_line = lines[0]
                attempts_line = lines[1] if len(lines) > 1 else ''
                correct_line = lines[2] if len(lines) > 2 else ''
                hint_line = lines[3] if len(lines) > 3 else ''
                
                is_first_try = 'Попытки:' in attempts_line and attempts_line.count(',') == 0
                used_hint = 'Да' in hint_line
                
                icon = '✅' if is_first_try and not used_hint else '🔄' if not used_hint else '💡'
                
                formatted_details += f"\n{icon} *Вопрос {idx}*\n"
                
                q_text = re.sub(r'Вопрос \d+: ', '', question_line)
                if len(q_text) > 60:
                    q_text = q_text[:57] + '...'
                formatted_details += f"_{q_text}_\n"
                
                if 'Попытки:' in attempts_line:
                    formatted_details += f"{attempts_line}\n"
                if 'Правильный ответ:' in correct_line:
                    formatted_details += f"{correct_line}\n"
        else:
            formatted_details = "\n_Детали недоступны_"
        
        footer = f"""
━━━━━━━━━━━━━━━━━━━━━
🚀 Отправлено через poehali.dev"""
        
        message = header + formatted_details + footer
        
        if len(message) > 4000:
            message = message[:3950] + "\n\n_(сообщение обрезано)_" + footer
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        print(f'[DEBUG] Sending to Telegram chat_id: {chat_id}')
        print(f'[DEBUG] Message length: {len(message)} chars')
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            telegram_response = json.loads(response.read().decode('utf-8'))
            
            print(f'[DEBUG] Telegram response: {telegram_response}')
            
            if telegram_response.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Результаты отправлены в Telegram'
                    })
                }
            else:
                print(f'[ERROR] Telegram API error: {telegram_response}')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': False,
                        'message': f"Ошибка Telegram: {telegram_response.get('description', 'Unknown')}"
                    })
                }
        
    except Exception as e:
        print(f'[ERROR] Exception: {str(e)}')
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': False,
                'message': f'Ошибка отправки: {str(e)}'
            })
        }