import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("creates a solo record from the home shortcut", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "冲，打开快捷记录" }));
    expect(screen.getByRole("dialog", { name: "快捷记录" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存记录" }));

    expect(await screen.findByText("撸啊撸")).toBeInTheDocument();
    expect(screen.getByText("本周次数")).toBeInTheDocument();
  });

  it("creates a sex record and shows it in history", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "冲，打开快捷记录" }));
    await user.click(screen.getByRole("button", { name: "干一炮" }));
    await user.click(screen.getByRole("button", { name: "保存记录" }));
    await user.click(screen.getByRole("button", { name: "记录" }));

    expect(await screen.findByText("干一炮")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑 干一炮 记录" })).toBeInTheDocument();
  });

  it("expands details and saves trigger tags plus note", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "冲，打开快捷记录" }));
    await user.click(screen.getByRole("button", { name: "展开补充" }));
    await user.click(screen.getByRole("button", { name: "睡前无聊" }));
    await user.type(screen.getByLabelText("随手补一句"), "睡前刷到了刺激内容");
    await user.click(screen.getByRole("button", { name: "保存记录" }));
    await user.click(screen.getByRole("button", { name: "AI射" }));

    expect((await screen.findAllByText(/睡前/)).length).toBeGreaterThan(0);
  });

  it("opens the home intro and data popup", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "查看射了没简介和首页数据" }));

    expect(screen.getByRole("dialog", { name: "射了没简介和数据" })).toBeInTheDocument();
    expect(screen.getByText("一个不装正经的身体节奏表")).toBeInTheDocument();
  });

  it("deletes the latest record and recalculates home state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "冲，打开快捷记录" }));
    await user.click(screen.getByRole("button", { name: "保存记录" }));
    await user.click(screen.getByRole("button", { name: "记录" }));
    const item = screen.getByText("撸啊撸").closest("article");
    expect(item).toBeTruthy();
    await user.click(within(item as HTMLElement).getByRole("button", { name: /删除/ }));
    await user.click(screen.getByRole("button", { name: "首页" }));

    expect(screen.getAllByText("还没发射记录").length).toBeGreaterThan(0);
  });
});
