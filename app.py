# Mengimpor library yang dibutuhkan
from flask import Flask, render_template, request, jsonify 
import google.generativeai as genai
import os

# Membuat aplikasi web Flask
app = Flask(__name__)

# Mengambil dan mengkonfigurasi API Key dari environment variable
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GOOGLE_API_KEY tidak ditemukan. Jalankan 'export GOOGLE_API_KEY=...' di terminal.")
else:
    genai.configure(api_key=api_key)

# Fungsi untuk menampilkan halaman utama (index.html)
@app.route('/')
def index():
    return render_template('index.html')

# Fungsi utama untuk memproses chat
@app.route('/chat', methods=['POST'])
def chat():
    # Mengambil pesan dari pengguna
    user_message = request.json['message']

    try:
        # Memilih model AI yang akan digunakan
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        # --- UBAH KEPRIBADIAN CHATBOT DI SINI ---
        # Memberi instruksi (prompt) tentang persona/gaya bahasa chatbot
        persona_prompt = "Anggap lo adalah temen chat gue yang asik dan up-to-date. Jawab pertanyaan dari gue pake bahasa gaul yang santai (pake lo/gue). Jawabannya to the point aja, jangan kaku kayak kanebo kering, ya!"
        
        # Menggabungkan persona dengan pertanyaan pengguna
        final_prompt = f"{persona_prompt}\n\nPertanyaan dari pengguna: \"{user_message}\""
        
        # Mengirim prompt ke model Gemini untuk mendapatkan jawaban
        response = model.generate_content(final_prompt)
        
        # Mengirim jawaban kembali ke halaman web
        return jsonify({'response': response.text})

    except Exception as e:
        # Fungsi untuk menangani jika terjadi error
        print(f"Terjadi Error di fungsi chat: {e}") 
        return jsonify({'response': f"Waduh, ada masalah di dapur nih. Coba lagi ya. (Error: {str(e)})"})

# Perintah untuk menjalankan aplikasi web
if __name__ == '__main__':
    app.run(debug=True)
