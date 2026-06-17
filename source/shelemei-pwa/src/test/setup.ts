import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
