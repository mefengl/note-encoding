/**
 * @oslojs/encoding 库的主入口文件
 * 
 * 这个文件作为库的主入口点，负责从各个具体实现模块中导出所有编码和解码函数。
 * 库实现了多种数据编码方案，包括：
 * - 十六进制编码 (Hex)：将二进制数据转换为十六进制字符串表示
 * - Base32编码：使用32个字符（通常是字母A-Z和数字2-7）表示二进制数据
 * - Base64编码：使用64个字符（A-Z、a-z、0-9、+、/）表示二进制数据
 * - Base64url编码：类似Base64，但使用URL安全字符（+和/替换为-和_）
 * 
 * 所有实现均基于RFC 4648标准 (https://datatracker.ietf.org/doc/html/rfc4648)
 */

// 导出十六进制编码/解码函数
export { encodeHexLowerCase, encodeHexUpperCase, decodeHex } from "./hex.js";

// 导出Base32编码/解码函数
export {
	encodeBase32,
	encodeBase32NoPadding,
	encodeBase32LowerCase,
	encodeBase32LowerCaseNoPadding,
	encodeBase32UpperCase,
	encodeBase32UpperCaseNoPadding,
	decodeBase32,
	decodeBase32IgnorePadding
} from "./base32.js";

// 导出Base64和Base64url编码/解码函数
export {
	encodeBase64,
	encodeBase64NoPadding,
	encodeBase64url,
	encodeBase64urlNoPadding,
	decodeBase64,
	decodeBase64IgnorePadding,
	decodeBase64url,
	decodeBase64urlIgnorePadding
} from "./base64.js";
