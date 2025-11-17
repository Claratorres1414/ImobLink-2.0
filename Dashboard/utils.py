def extract_token_from_response_json(data: dict):
    if not isinstance(data, dict):
        return None
    if "token" in data and isinstance(data["token"], str):
        return data["token"]
    if "access_token" in data and isinstance(data["access_token"], str):
        return data["access_token"]
    if "token" in data and isinstance(data["token"], dict):
        return data["token"].get("access_token")
    for v in data.values():
        if isinstance(v, str) and v.count(".") == 2:
            return v
    return None
# utils.py

