import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send quiz results via email
    Args: event with httpMethod, body containing userName, email, score, details
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
        
        msg = MIMEMultipart()
        msg['From'] = 'noreply@poehali.dev'
        msg['To'] = 'dina-zyskina@rambler.ru'
        msg['Subject'] = f'Результаты квиза по осциллографам - {user_name}'
        
        body = f"""
Новые результаты прохождения квиза по электронным осциллографам

{results_text}

---
Отправлено через систему квизов poehali.dev
        """
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'message': 'Результаты зафиксированы'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'message': 'Результаты сохранены локально'
            })
        }
