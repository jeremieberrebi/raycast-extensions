import AppKit
import Foundation

guard CommandLine.arguments.count == 2 else {
  fputs("Expected one text argument.\n", stderr)
  exit(1)
}

let text = CommandLine.arguments[1]
let fullRange = NSRange(location: 0, length: (text as NSString).length)
let content = NSMutableAttributedString(string: text)
let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .right
paragraph.baseWritingDirection = .rightToLeft

content.addAttribute(.paragraphStyle, value: paragraph, range: fullRange)
content.addAttribute(
  .writingDirection,
  value: [
    NSWritingDirection.rightToLeft.rawValue |
      NSWritingDirectionFormatType.embedding.rawValue,
  ],
  range: fullRange
)

let rtf = try content.data(
  from: fullRange,
  documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf]
)

let pasteboard = NSPasteboard.general
pasteboard.clearContents()
pasteboard.setData(rtf, forType: .rtf)
pasteboard.setString(text, forType: .string)
