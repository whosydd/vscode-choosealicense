import { window, workspace, ConfigurationTarget } from "vscode";
import { json } from "web-request";

interface License {
  key: string;
  name: string;
}

interface LicenseText {
  body: string;
}

export class Utils {
  public static async getLicenses(): Promise<License[]> {
    const url = "https://api.github.com/licenses";
    let data = await json<License[]>(url, {
      headers: { "User-Agent": "request" }
    });

    return data;
  }

  public static async getLicenseText(key: string): Promise<LicenseText> {
    const url = `https://api.github.com/licenses/${key}`;
    let data = await json<LicenseText>(url, {
      headers: { "User-Agent": "request" }
    });

    return data;
  }

  public static replaceYear(year: string, lKey: string, lText: string): string {
    switch (lKey) {
      case "agpl-3.0":
      case "gpl-2.0":
      case "gpl-3.0":
      case "lgpl-2.1":
        lText = lText.replace(/<year>/g, year);
        break;

      case "apache-2.0":
        lText = lText.replace(/\[yyyy\]/g, year);
        break;

      case "bsd-2-clause":
      case "bsd-3-clause":
      case "mit":
        lText = lText.replace(/\[year\]/g, year);
        break;

      case "cc0-1.0":
      case "epl-2.0":
      case "lgpl-3.0":
      case "mpl-2.0":
      case "unlicense":
        break;

      default:
        break;
    }

    return lText;
  }

  public static replaceAuthor(
    author: string,
    lKey: string,
    lText: string
  ): string {
    switch (lKey) {
      // TODO: apgl-3.0 not working.
      case "apgl-3.0":
      case "gpl-2.0":
      case "gpl-3.0":
      case "lgpl-2.1":
        lText = lText.replace(/<name of author>/g, author);
        break;

      case "apache-2.0":
        lText = lText.replace(/\[name of copyright owner\]/g, author);
        break;

      case "bsd-2-clause":
      case "bsd-3-clause":
      case "mit":
        lText = lText.replace(/\[fullname\]/g, author);
        break;

      case "cc0-1.0":
      case "epl-2.0":
      case "lgpl-3.0":
      case "mpl-2.0":
      case "unlicense":
        break;

      default:
        break;
    }

    return lText;
  }

  public static async setConfProperty(property: string): Promise<void> {
    const value = await window.showInputBox({
      prompt: `Set ${property} for licenses`
    });

    if (workspace.workspaceFolders) {
      const target = await window.showQuickPick(
        [
          {
            label: "User",
            description: "User Settings",
            target: ConfigurationTarget.Global
          },
          {
            label: "Workspace",
            description: "Workspace Settings",
            target: ConfigurationTarget.Workspace
          }
        ],
        { placeHolder: "Select the configuration target." }
      );

      if (value && target) {
        await workspace
          .getConfiguration()
          .update(`license.${property}`, value, target.target);
      }
    } else {
      await workspace
        .getConfiguration()
        .update(`license.${property}`, value, ConfigurationTarget.Global);
    }
  }
}