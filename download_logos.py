import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

os.makedirs("static/img/banks", exist_ok=True)

req_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

domains = {
    "SBI": "sbi.co.in",
    "HDFC": "hdfcbank.com",
    "ICICI": "icicibank.com",
    "AU SFB": "aubank.in",
    "Jana SFB": "janabank.com",
    "Unity SFB": "theunitybank.com",
    "Suryoday SFB": "suryodaybank.com",
    "Post Office": "indiapost.gov.in"
}

for name, domain in domains.items():
    url = f"https://logo.clearbit.com/{domain}"
    filename = name.replace(" ", "_").lower() + ".png"
    filepath = os.path.join("static", "img", "banks", filename)
    
    req = urllib.request.Request(url, headers=req_headers)
    try:
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Success: {name}")
    except Exception as e:
        print(f"Error {name}: {e}")
