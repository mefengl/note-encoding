# @oslojs/encoding

**Documentation: https://encoding.oslojs.dev**

## 中文阅读指南 (Chinese Reading Guide)

这个库是用于各种编码和解码的工具库，按照以下顺序阅读源代码可以更好地理解其实现：

1. [src/index.ts](./src/index.ts) - 主入口文件，导出所有功能函数
2. [src/hex.ts](./src/hex.ts) - 十六进制编码和解码实现
3. [src/base32.ts](./src/base32.ts) - Base32 编码和解码实现
4. [src/base64.ts](./src/base64.ts) - Base64 和 Base64url 编码和解码实现
5. 测试文件：
   - [src/hex.test.ts](./src/hex.test.ts)
   - [src/base32.test.ts](./src/base32.test.ts)
   - [src/base64.test.ts](./src/base64.test.ts)

每个文件都包含了对应编码方案的编码和解码函数，实现遵循了 [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648) 标准。

---

A JavaScript library for encoding and decoding data with hexadecimal, base32, base64, and base64url encoding schemes based on [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648). Implementations may be stricter than most to follow the RFC as close as possible.

- Runtime-agnostic
- No third-party dependencies
- Fully typed

```ts
import { encodeBase64, decodeBase64 } from "@oslojs/encoding";

const data: Uint8Array = new TextEncoder().encode("hello world");
const encoded = encodeBase64(data);
const decoded = decodeBase64(encoded);
```

## Installation

```
npm i @oslojs/encoding
```
