from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
import random
import datetime

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Load demotivating quotes
def load_quotes():
    try:
        with open('demotivating_quotes.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"quotes": ["Why even try?", "You'll probably fail anyway.", "Others are better than you."]}

quotes_data = load_quotes()

@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session.get('username'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        
        try:
            # Insert user into Supabase
            result = supabase.table('users').insert({
                'name': name,
                'description': description,
                'created_at': datetime.datetime.now().isoformat()
            }).execute()
            
            if result.data:
                flash('Registration successful! Please login.', 'success')
                return redirect(url_for('login'))
        except Exception as e:
            flash('Registration failed. Please try again.', 'error')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        answer = request.form['answer']
        
        # Check if answer is wrong (as required)
        if int(answer) == 7:  # 3+4=7, so wrong answer is anything else
            flash('Please enter a wrong answer to the math question!', 'error')
            return render_template('login.html')
        
        try:
            # Check user in Supabase
            result = supabase.table('users').select('*').eq('name', name).eq('description', description).execute()
            
            if result.data:
                session['user_id'] = result.data[0]['id']
                session['username'] = name
                return redirect(url_for('home'))
            else:
                flash('User not found. Please register first.', 'error')
        except Exception as e:
            flash('Login failed. Please try again.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/procrastination', methods=['GET', 'POST'])
def procrastination():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        task = request.form['task']
        deadline = request.form['deadline']
        
        try:
            supabase.table('tasks').insert({
                'user_id': session['user_id'],
                'task': task,
                'deadline': deadline,
                'created_at': datetime.datetime.now().isoformat()
            }).execute()
            
            # Return a demotivating quote
            quote = random.choice(quotes_data['quotes'])
            return jsonify({'quote': quote})
        except Exception as e:
            return jsonify({'error': 'Failed to add task'})
    
    return render_template('procrastination.html', username=session.get('username'))

@app.route('/love-meter', methods=['GET', 'POST'])
def love_meter():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        name1 = request.form['name1']
        name2 = request.form['name2']
        is_hate = 'is_hate' in request.form
        
        if is_hate:
            compatibility = random.randint(85, 99)
        else:
            compatibility = random.randint(1, 25)
        
        return jsonify({'compatibility': compatibility})
    
    return render_template('love_meter.html', username=session.get('username'))

@app.route('/life-decision')
def life_decision():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    decisions = [
        "Quit your job and become a professional meme creator",
        "Move to Antarctica and start a penguin podcast",
        "Learn to communicate only through interpretive dance",
        "Adopt 47 cats and name them all Steve",
        "Start a business selling invisible socks",
        "Become a professional couch tester",
        "Learn to juggle flaming marshmallows",
        "Start a cult worshipping rubber ducks"
    ]
    
    decision = random.choice(decisions)
    return render_template('life_decision.html', decision=decision, username=session.get('username'))

@app.route('/dont-tap')
def dont_tap():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dont_tap.html', username=session.get('username'))

@app.route('/get-overdue-tasks')
def get_overdue_tasks():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'})
    
    try:
        # Get overdue tasks
        current_time = datetime.datetime.now().isoformat()
        result = supabase.table('tasks').select('*').eq('user_id', session['user_id']).lt('deadline', current_time).execute()
        
        if result.data:
            messages = [
                "Your deadline passed! Time to embrace the procrastination lifestyle! 🎉",
                "Failure is just success in progress... very, very slow progress! 😴",
                "Why do today what you can do next year? 📅",
                "Congratulations! You've mastered the art of delay! 🏆"
            ]
            return jsonify({'message': random.choice(messages), 'tasks': len(result.data)})
        
        return jsonify({'message': None})
    except Exception as e:
        return jsonify({'error': 'Failed to check tasks'})

if __name__ == '__main__':
    app.run(debug=True)