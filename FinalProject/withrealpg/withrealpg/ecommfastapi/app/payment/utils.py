import uuid
def generate_mock_ids() -> tuple[str, str, str]:
  rand = lambda: uuid.uuid4().hex[:8].upper()
  return {
    f"MOCK-OD-{rand()}",
    f"MOCK-PY-{rand()}",
    f"MOCK-SI-{rand()}",
  }