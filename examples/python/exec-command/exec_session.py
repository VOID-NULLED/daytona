from time import sleep

from daytona import Daytona, SessionExecuteRequest


def main():
    daytona = Daytona()
    sandbox = daytona.create()

    exec_session_id = "exec-session-1"
    sandbox.process.create_session(exec_session_id)

    # Get the session details any time
    session = sandbox.process.get_session(exec_session_id)
    print(session)

    exec_command1 = sandbox.process.execute_session_command(
        exec_session_id, SessionExecuteRequest(command='printf "Test command printout"', run_async=False)
    )
    print("Printing first command output")
    print(f"[STDOUT]: {exec_command1.stdout}")
    print(f"[STDERR]: {exec_command1.stderr}")

    print("Executing second command")
    # Execute a second command in the session and see that the environment variable is set
    exec_command2 = sandbox.process.execute_session_command(
        exec_session_id,
        SessionExecuteRequest(
            command='printf "Enter your name: \\n" && read name && printf "Hello, %s\\n" "$name"', run_async=True
        ),
    )
    sleep(2)

    print("Now getting logs for the second command")
    logs = sandbox.process.get_session_command_logs(exec_session_id, exec_command2.cmd_id)
    print(f"[STDOUT]: {logs.stdout}")
    print(f"[STDERR]: {logs.stderr}")

    # Write input to the command
    sandbox.process.write_session_command_input(exec_session_id, exec_command2.cmd_id, "Alice\n")
    print("Input written to the command")
    sleep(2)

    print("Now getting logs for the second command")
    logs = sandbox.process.get_session_command_logs(exec_session_id, exec_command2.cmd_id)
    print(f"[STDOUT]: {logs.stdout}")
    print(f"[STDERR]: {logs.stderr}")

    # And of course you can delete the session at any time
    sandbox.process.delete_session(exec_session_id)

    daytona.delete(sandbox)


if __name__ == "__main__":
    main()
