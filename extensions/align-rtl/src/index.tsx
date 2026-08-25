import {
  Clipboard,
  Toast,
  closeMainWindow,
  environment,
  getSelectedText,
  showToast,
} from "@raycast/api";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function getInputText(): Promise<string | undefined> {
  try {
    const selectedText = await getSelectedText();
    if (selectedText.trim()) {
      return selectedText;
    }
  } catch {
    // No selected text available in the active app.
  }

  const clipboardText = await Clipboard.readText();
  if (clipboardText?.trim()) {
    return clipboardText;
  }

  return undefined;
}

async function pasteRtlRichText(text: string) {
  const scriptPath = join(environment.assetsPath, "paste-rtl.swift");

  await closeMainWindow({ clearRootSearch: true });
  await execFileAsync("/usr/bin/swift", [scriptPath, text]);
  await setTimeout(100);
  await execFileAsync("/usr/bin/osascript", [
    "-e",
    'tell application "System Events" to keystroke "v" using command down',
  ]);
}

export default async function Command() {
  try {
    const inputText = await getInputText();

    if (!inputText) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No text found",
        message: "Select some text or copy text to the clipboard first.",
      });
      return;
    }

    await pasteRtlRichText(inputText);

    await showToast({
      style: Toast.Style.Success,
      title: "RTL content pasted",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Unable to transform text",
      message:
        error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}
