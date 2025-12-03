"""Utility script to stress-test the Supabase student registration endpoint."""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import os
import time
import uuid
from typing import Optional, Tuple

import requests


def random_student_id() -> str:
	return uuid.uuid4().hex


def build_payload(
	index: int,
	city_id: str,
	class_name: str,
	class_no: str,
	surname_prefix: str,
) -> dict:
	return {
		"student_id": random_student_id(),
		"name": "test",
		"surname": f"{surname_prefix}{index:03d}",
		"class": class_name,
		"class_no": class_no,
		"city_id": city_id,
	}


def send_request(
	session: requests.Session,
	url: str,
	headers: dict,
	payload: dict,
	request_idx: int,
) -> Tuple[int, Optional[int], bool, str]:
	try:
		response = session.post(url, headers=headers, json=payload, timeout=10)
		response.raise_for_status()
		return request_idx, response.status_code, True, response.text
	except requests.RequestException as exc:
		status = getattr(exc.response, "status_code", None)
		body = exc.response.text if getattr(exc, "response", None) else str(exc)
		return request_idx, status, False, body


def main() -> None:
	parser = argparse.ArgumentParser(
		description="Fire a burst of student registration requests against Supabase"
	)
	parser.add_argument(
		"--url",
		default=os.environ.get("SUPABASE_FUNCTION_URL") or "https://lhimlqqxahyumybljyne.supabase.co/functions/v1/register-trip",
		help="Target HTTP endpoint (defaults to SUPABASE_FUNCTION_URL)",
	)
	parser.add_argument(
		"--api-key",
		default=os.environ.get("SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaW1scXF4YWh5dW15YmxqeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM3OTgsImV4cCI6MjA3ODk1OTc5OH0.2Z2q3tg1Za6hvjfWpBdFXMbJmzhE5UD3U1JSh14_tx8",
		help="Supabase anon/service key for Authorization header",
	)
	parser.add_argument(
		"--city-id",
		default=os.environ.get("SUPABASE_CITY_ID") or "3f7ed9be-a68f-4748-a470-0bf58c9e6a42",
		help="City UUID (defaults to SUPABASE_CITY_ID)",
	)
	parser.add_argument("--count", type=int, default=900, help="Requests to send")
	parser.add_argument("--window", type=float, default=30.0, help="Window in seconds")
	parser.add_argument(
		"--workers",
		type=int,
		default=50,
		help="Max concurrent requests (keep low to respect rate limits)",
	)
	parser.add_argument(
		"--class",
		dest="class_name",
		default="M7/1",
		help="Class value to include in each payload",
	)
	parser.add_argument(
		"--class-no",
		default="01",
		help="Class number to include in each payload",
	)
	parser.add_argument(
		"--surname",
		default="Tester",
		help="Surname prefix appended with an incremental counter",
	)
	args = parser.parse_args()

	if not args.url:
		raise SystemExit("Missing target URL. Pass --url or set SUPABASE_FUNCTION_URL.")
	if not args.city_id:
		raise SystemExit("Missing city ID. Pass --city-id or set SUPABASE_CITY_ID.")

	headers = {"Content-Type": "application/json"}
	if args.api_key:
		headers["apikey"] = args.api_key
		headers["Authorization"] = f"Bearer {args.api_key}"

	delay = args.window / max(args.count, 1)
	successes = 0
	failures = 0
	start = time.perf_counter()

	with requests.Session() as session, cf.ThreadPoolExecutor(max_workers=args.workers) as pool:
		futures = []
		for i in range(args.count):
			payload = build_payload(i, args.city_id, args.class_name, args.class_no, args.surname)
			futures.append(
				pool.submit(send_request, session, args.url, headers, payload, i + 1)
			)
			if i < args.count - 1:
				time.sleep(delay)

		for future in cf.as_completed(futures):
			idx, status, ok, body = future.result()
			if ok:
				successes += 1
				print(f"[{idx:02d}] OK {status}")
			else:
				failures += 1
				print(f"[{idx:02d}] ERR {status or 'N/A'} -> {body}")

	elapsed = time.perf_counter() - start
	print("-" * 40)
	print(f"Completed in {elapsed:.2f}s | Success: {successes} | Failures: {failures}")


if __name__ == "__main__":
	main()
