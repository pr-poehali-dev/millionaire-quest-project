import json
import os
import urllib.request
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Test Telegram bot with quiz results message
    Args: event with httpMethod
          context with request_id
    Returns: HTTP response with test result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        bot_token = os.environ.get('QUIZ_TG_BOT_TOKEN', '')
        chat_id = os.environ.get('QUIZ_TG_CHAT_ID', '')
        
        print(f'[DEBUG] Bot token length: {len(bot_token)}')
        print(f'[DEBUG] Chat ID: {chat_id}')
        
        if not bot_token:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': False,
                    'message': 'QUIZ_TG_BOT_TOKEN не установлен',
                    'token_length': 0
                })
            }
        
        if not chat_id:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': False,
                    'message': 'QUIZ_TG_CHAT_ID не установлен',
                    'token_length': len(bot_token)
                })
            }
        
        test_message = """🧪 *ТЕСТОВОЕ СООБЩЕНИЕ*

╔══════════════════════════
║ 🏆 *РЕЗУЛЬТАТЫ КВИЗА*
║ Отлично!
╚══════════════════════════

👤 *Студент:* Тестовый Пользователь
📧 *Email:* test@example.com

━━━━━━━━━━━━━━━━━━━━━
📊 *СТАТИСТИКА*
━━━━━━━━━━━━━━━━━━━━━

✅ *С первой попытки:* 9/11 (82%)
🔄 *Всего попыток:* 15
💡 *Использовано подсказок:* 2/3

━━━━━━━━━━━━━━━━━━━━━
📋 *ДЕТАЛИ ПО ВОПРОСАМ*
━━━━━━━━━━━━━━━━━━━━━

✅ *Вопрос 1*
_Какую функцию выполняет осциллограф?_
Попытки: Измеряет форму и параметры сигнала
Правильный ответ: Измеряет форму и параметры сигнала

🔄 *Вопрос 2*
_Какая функция соответствует элементу 'Регулятор..._
Попытки: Делает изображение четким, Изменяет яркость луча
Правильный ответ: Изменяет яркость луча

💡 *Вопрос 3*
_Какой элемент осциллографа 'Удерживает изображ..._
Попытки: Фокусировка, Синхронизация
Правильный ответ: Синхронизация

━━━━━━━━━━━━━━━━━━━━━
🚀 Отправлено через poehali.dev

✅ *Telegram бот работает корректно!*
Настоящие результаты квизов будут приходить в этот чат автоматически."""
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': test_message,
            'parse_mode': 'Markdown'
        }
        
        print(f'[DEBUG] Sending to Telegram...')
        print(f'[DEBUG] URL: {url[:50]}...')
        print(f'[DEBUG] Chat ID: {chat_id}')
        print(f'[DEBUG] Message length: {len(test_message)} chars')
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            telegram_response = json.loads(response.read().decode('utf-8'))
            
            print(f'[DEBUG] Telegram API response: {telegram_response}')
            
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
                        'message': '✅ Тестовое сообщение отправлено в Telegram!',
                        'token_length': len(bot_token),
                        'chat_id': chat_id,
                        'telegram_message_id': telegram_response.get('result', {}).get('message_id')
                    })
                }
            else:
                error_desc = telegram_response.get('description', 'Unknown error')
                print(f'[ERROR] Telegram API returned error: {error_desc}')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': False,
                        'message': f'❌ Telegram API ошибка: {error_desc}',
                        'token_length': len(bot_token),
                        'chat_id': chat_id,
                        'full_error': telegram_response
                    })
                }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'[ERROR] HTTP Error {e.code}: {error_body}')
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': False,
                'message': f'❌ HTTP Error {e.code}',
                'error_details': error_body,
                'token_length': len(os.environ.get('QUIZ_TG_BOT_TOKEN', ''))
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
                'message': f'❌ Ошибка: {str(e)}',
                'token_length': len(os.environ.get('QUIZ_TG_BOT_TOKEN', ''))
            })
        }
