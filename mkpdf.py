import asyncio,sys
sys.path.insert(0,'/Users/megatron010203')
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        pg=await b.new_page()
        await pg.goto('file:///Users/megatron010203/naves_site/eskizy.html',wait_until='networkidle')
        await pg.wait_for_timeout(500)
        await pg.pdf(path='/Users/megatron010203/naves_site/FORTE_STEEL_эскизы_6_навесов.pdf',
                    format='A3', print_background=True,
                    margin={'top':'10mm','bottom':'10mm','left':'8mm','right':'8mm'})
        print('pdf ok')
        await b.close()
asyncio.run(main())
