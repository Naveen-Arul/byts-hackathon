import requests

def main():
    url = "http://localhost:8080/api/evaluate"
    payload = {
        "language": "python",
        "student_code": "print('Hello, World!')"
    }
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response Keys:")
            for k in data.keys():
                print(f"  {k}")
            print("\nagent_outputs keys:")
            if "agent_outputs" in data:
                for k, v in data["agent_outputs"].items():
                    print(f"  {k}: {type(v)} -> {list(v.keys()) if isinstance(v, dict) else v}")
            else:
                print("  agent_outputs NOT found in response!")
        else:
            print(response.text)
    except Exception as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    main()
