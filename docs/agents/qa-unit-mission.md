# QA Unit — Test Report

**Agent**: qa-unit  
**Generated**: 2026-08-06T18:19:32.570Z

---

## Results

{
  "type": "unit",
  "framework": "jest",
  "total": 8,
  "passed": 4,
  "failed": 4,
  "skipped": 0,
  "status": "fail",
  "failures": [
    {
      "testName": "src/__tests__/accessibility.test.ts",
      "error": "TS1005: '>' expected at line 24 column 39",
      "stackTrace": "src/__tests__/accessibility.test.ts:24:39"
    },
    {
      "testName": "src/__tests__/Countdown.test.tsx",
      "error": "Expected number of calls: 1 Received number of calls: 0",
      "stackTrace": "src/__tests__/Countdown.test.tsx:39:24"
    },
    {
      "testName": "src/__tests__/performance.test.ts",
      "error": "TS1005: '}' expected at line 73 column 1",
      "stackTrace": "src/__tests__/performance.test.ts:73:1"
    },
    {
      "testName": "src/audio/AudioManager.test.ts",
      "error": "Matcher error: received value must be a mock or spy function",
      "stackTrace": "src/audio/AudioManager.test.ts:??:??"
    }
  ],
  "agentId": "qa-unit-agent",
  "cases": []
}
