// SPDX-License-Identifier: MIT
//
// Unit tests for .dex name validation logic.
// .dex 이름 검증 단위 테스트.

import { describe, it, expect } from "vitest";
import { isValidDexName } from "../src/resolution.js";

describe("isValidDexName", () => {
  it("accepts simple valid names", () => {
    expect(isValidDexName("alice.dex")).toBe(true);
    expect(isValidDexName("kimroy.dex")).toBe(true);
    expect(isValidDexName("abc.dex")).toBe(true);
  });

  it("rejects too-short labels", () => {
    expect(isValidDexName("ab.dex")).toBe(false);
    expect(isValidDexName(".dex")).toBe(false);
  });

  it("rejects wrong TLD", () => {
    expect(isValidDexName("alice.eth")).toBe(false);
    expect(isValidDexName("alice")).toBe(false);
  });

  it("rejects nested subdomains", () => {
    expect(isValidDexName("foo.alice.dex")).toBe(false);
  });

  it("rejects leading/trailing hyphens", () => {
    expect(isValidDexName("-alice.dex")).toBe(false);
    expect(isValidDexName("alice-.dex")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidDexName(123 as unknown as string)).toBe(false);
    expect(isValidDexName(null as unknown as string)).toBe(false);
    expect(isValidDexName(undefined as unknown as string)).toBe(false);
  });
});
