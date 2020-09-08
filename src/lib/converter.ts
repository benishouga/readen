import { extract, extractRepeat } from "./regexp-util";

export type MeaningRow = {
  group?: string;
  type?: string;
  text?: string;
  tags?: string[];
  remarks?: string[];
  examples?: Example[];
  additionals?: Additional[];
  links?: string[];
};

export type Example = {
  en: string;
  ja: string;
};

export type Additional = {
  type: string;
  value: string;
};

export class Converter {
  private dictionary: Map<string, MeaningRow[]> = new Map();
  private indexes: Map<string, string[]> = new Map();

  async convert(text: string) {
    await text
      .split("\n")
      .filter((line) => line)
      .map((line) => async () => this.addRow(line))
      .reduce((promise, next) => promise.then(next), Promise.resolve());
    return { dictionary: this.dictionary, indexes: this.indexes };
  }

  private async addRow(line: string) {
    line = line.slice(1);
    const index = line.indexOf(":");
    const wordPart = line.slice(0, index).trim();
    const meaningPart = line.slice(index + 1).trim();
    const { word, group, type } = this.parseWorkdPart(wordPart);
    const { text, tags, links, remarks, examples, additionals, linkFrom } = this.parseMeaningPart(meaningPart);

    const meanings = this.getHolder(word);
    meanings.push({ text, type, group, links, tags, examples, remarks, additionals });
    linkFrom.forEach((item) => this.pushIndex(item, word));
    const lower = word.toLowerCase();
    if (lower !== word) {
      this.pushIndex(lower, word);
    }
  }

  private getHolder(word: string) {
    if (!this.dictionary) {
      throw new Error();
    }
    let meanings = this.dictionary.get(word);
    if (!meanings) {
      meanings = [];
      this.dictionary.set(word, meanings);
    }
    return meanings;
  }

  private parseWorkdPart(wordPart: string) {
    return extract(/^(?<word>[^{]+)(\{\{?(?<group>\d*)-?(?<type>[^}]*?)(-\d+)?\}?\})?/, wordPart);
  }

  private parseMeaningPart(meaningPart: string) {
    const { text, otherParts } = this.extractMeaning(meaningPart);
    const tags = this.extractTags(text);
    const links = this.extractLinks(text);
    const { remarks, examples, additionals } = this.extractOther(otherParts);
    const linkFrom: string[] = this.extractLinkFrom(additionals);
    return { text, tags, links, remarks, examples, additionals, linkFrom };
  }

  private extractMeaning(meaningPart: string) {
    return extract(/^(?<text>[^■◆【]*)(?<otherParts>.*)/, meaningPart);
  }

  private extractExample(example: string) {
    const index = example.search(/(?=[^\x20-\x7E].*$)/);
    return {
      en: example.slice(0, index),
      ja: example.slice(index),
    };
  }

  private extractOther(other: string) {
    const extracted = extractRepeat(/(?:◆(?<remarks>[^■◆【]+)|■・(?<examples>[^■◆【]+)|◆?(?<additionals>【[^■◆【]+))?/g, other);
    const result: { remarks: string[]; examples: Example[]; additionals: Additional[] } = {
      remarks: extracted.remarks,
      examples: [],
      additionals: [],
    };

    extracted.examples?.forEach((example: string) => {
      result.examples.push(this.extractExample(example));
    });

    extracted.additionals?.forEach((additional: string) => {
      const { type, value } = extract(/【(?<type>[^】]+)】(?<value>.*?)、?$/, additional);
      if (type) result.additionals.push({ type, value });
    });
    return result;
  }

  private extractTags(meaning: string) {
    const result = extractRepeat(/(〈(?<tag>[^〉]+?)〉|《(?<label>[^》]+?)》)/g, meaning);
    return (result.tag || []).concat(result.label || []);
  }

  private extractLinks(meaning: string) {
    return extractRepeat(/＝?<?→(?<link>[^>、＝<→■◆【]+)>?/g, meaning).link;
  }

  private extractLinkFrom(additionals: Additional[]): string[] {
    return additionals.reduce<string[]>((array, item) => {
      if (item.type === "変化") {
        item.value.split("、").forEach((parts) => {
          const { value } = extract(/(〈[^〉]+?〉|《[^》]+?》)+(?<value>.*)/, parts);
          value
            .split("|")
            .map((v) => v.trim())
            .forEach((v) => array.push(v));
        });
      } else if (item.type === "略" || item.type === "女性形") {
        item.value
          .split(";")
          .map((v) => v.trim())
          .forEach((v) => array.push(v));
      }
      return array;
    }, []);
  }

  private pushIndex(from: string, to: string) {
    let array = this.indexes.get(from);
    if (!array) {
      array = [];
      this.indexes.set(from, array);
    }
    if (!array.includes(to)) {
      array.push(to);
    }
  }
}
