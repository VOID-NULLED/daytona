import asyncio

from daytona import AsyncDaytona


async def main():
    try:
        sandbox = None
        async with AsyncDaytona() as daytona:
            sandbox = await daytona.create()

        if sandbox:
            response = await sandbox.process.exec('echo "Hello World from exec!"', timeout=10)
            print(response.result)
    finally:
        if sandbox:
            await sandbox.delete()
            await sandbox.close()


if __name__ == "__main__":
    asyncio.run(main())
