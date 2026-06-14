import urllib.request
import ssl
try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    urllib.request.urlretrieve("https://gist.githubusercontent.com/fraguada/7998492/raw/0e74bcf6825c9c991ba0f7a93ce4eec667c4e402/test.ghx", "tests/real2.ghx", context=ctx)
    with open("tests/real2.ghx") as f:
        print(f.read()[:500])
except Exception as e:
    print(e)
