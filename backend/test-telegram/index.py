import json
import os
import urllib.request
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Test Telegram bot connection
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
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
        
        print(f'[DEBUG] Bot token length: {len(bot_token)}')
        print(f'[DEBUG] Chat ID: {chat_id}')
        
        if not bot_token:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'message': 'TELEGRAM_BOT_TOKEN не установлен'
                })
            }
        
        if not chat_id:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'message': 'TELEGRAM_CHAT_ID не установлен'
                })
            }
        
        test_message = """🧪 *Тестовое сообщение*

✅ Telegram бот работает корректно!
🤖 Бот подключен к системе квизов
📱 Результаты тестов будут приходить сюда

━━━━━━━━━━━━━━━━━━━━━
🚀 poehali.dev"""
        
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': test_message,
            'parse_mode': 'Markdown'
        }
        
        print(f'[DEBUG] Sending to: {url[:50]}...')
        print(f'[DEBUG] Data: {json.dumps(data)[:100]}...')
        
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
                    'body': json.dumps({
                        'success': True,
                        'message': 'Тестовое сообщение отправлено в Telegram!',
                        'telegram_response': telegram_response
                    })
                }
            else:
                error_msg = telegram_response.get('description', 'Unknown error')
                print(f'[ERROR] Telegram API error: {error_msg}')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'message': f'Ошибка Telegram API: {error_msg}',
                        'telegram_response': telegram_response
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
            'body': json.dumps({
                'success': False,
                'message': f'HTTP Error {e.code}: {error_body}'
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
            'body': json.dumps({
                'success': False,
                'message': f'Ошибка: {str(e)}'
            })
        }
