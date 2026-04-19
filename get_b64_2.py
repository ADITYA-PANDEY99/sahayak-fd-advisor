import base64

post_svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><path d='M10,80 L40,80 L70,30 L90,30 L50,90 L30,90 Z' fill='#eb1c24'/><path d='M10,60 L30,60 L60,10 L80,10 L40,70 L20,70 Z' fill='#eb1c24'/></svg>"
unity_svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><circle cx='50' cy='30' r='18' fill='#f47b20'/><circle cx='35' cy='65' r='18' fill='#0f3b7b'/><circle cx='65' cy='65' r='18' fill='#ffc20e'/></svg>"

post_b64 = base64.b64encode(post_svg.encode('utf-8')).decode('utf-8')
unity_b64 = base64.b64encode(unity_svg.encode('utf-8')).decode('utf-8')

print(f"POST: data:image/svg+xml;base64,{post_b64}")
print(f"UNITY: data:image/svg+xml;base64,{unity_b64}")
