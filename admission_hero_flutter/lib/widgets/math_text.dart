import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class MathText extends StatelessWidget {
  final String text;
  final TextStyle? textStyle;

  const MathText(
    this.text, {
    super.key,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    // Parse the text for inline and block math
    // Inline math: \(...\) or $...$
    // Block math: \[...\] or $$...$$

    List<Widget> children = [];

    // A simple regex to find math blocks
    // This matches:
    // 1. \[ ... \] (Block)
    // 2. $$ ... $$ (Block)
    // 3. \( ... \) (Inline)
    // 4. $ ... $ (Inline)

    // We will use a regular expression to split the string
    final RegExp mathRegex = RegExp(
        r'(\$\$(.*?)\$\$)|(\\\[(.*?)\\\])|(\$(.*?)\$)|(\\\((.*?)\\\))',
        dotAll: true);

    int lastMatchEnd = 0;

    for (final match in mathRegex.allMatches(text)) {
      if (match.start > lastMatchEnd) {
        children.add(Text(
          text.substring(lastMatchEnd, match.start),
          style: textStyle,
        ));
      }

      // Determine match type and extract content
      String mathContent = '';
      bool isBlock = false;

      if (match.group(1) != null) {
        // $$...$$
        mathContent = match.group(2)!;
        isBlock = true;
      } else if (match.group(3) != null) {
        // \[...\]
        mathContent = match.group(4)!;
        isBlock = true;
      } else if (match.group(5) != null) {
        // $...$
        mathContent = match.group(6)!;
        isBlock = false;
      } else if (match.group(7) != null) {
        // \(...\)
        mathContent = match.group(8)!;
        isBlock = false;
      }

      try {
        if (isBlock) {
          children.add(
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Math.tex(
                mathContent,
                mathStyle: MathStyle.display,
                textStyle: textStyle,
              ),
            ),
          );
        } else {
          children.add(
            Math.tex(
              mathContent,
              mathStyle: MathStyle.text,
              textStyle: textStyle,
            ),
          );
        }
      } catch (e) {
        // Fallback to text if math parsing fails
        children.add(Text(match.group(0)!, style: textStyle));
      }

      lastMatchEnd = match.end;
    }

    if (lastMatchEnd < text.length) {
      children.add(Text(
        text.substring(lastMatchEnd),
        style: textStyle,
      ));
    }

    if (children.isEmpty) {
      return Text(text, style: textStyle);
    }

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      children: children,
    );
  }
}
