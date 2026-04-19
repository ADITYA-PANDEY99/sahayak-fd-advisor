import urllib.request
import base64

url = "https://logo.clearbit.com/indiapost.gov.in"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    img_data = urllib.request.urlopen(req).read()
    b64 = base64.b64encode(img_data).decode('utf-8')
    print("SUCCESS_POST_OFFICE")
    with open('post_b64.txt', 'w') as f:
        f.write(f"data:image/png;base64,{b64}")
except Exception as e:
    print("ERROR:", e)
