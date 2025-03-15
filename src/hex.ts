/**
 * 十六进制编码与解码模块
 * 
 * 本模块实现了二进制数据与十六进制字符串之间的转换。
 * 十六进制编码将每个字节（8位）拆分为两个4位的组，并为每个4位组分配一个十六进制字符（0-9, A-F或a-f）。
 * 这使得每个字节都能被表示为两个可显示的ASCII字符，即原始数据体积扩大为原来的2倍。
 * 
 * 比如，字节值为156（二进制为10011100）将被编码为"9C"（9表示1001，C表示1100）。
 * 
 * 常见应用场景：
 * - 表示二进制数据，如Hash值、密钥等
 * - 表示计算机内存地址
 * - 表示RGB颜色值（如#FF0000表示红色）
 */

/**
 * 将二进制数据编码为大写十六进制字符串
 * 
 * @param data - 要编码的二进制数据，以Uint8Array形式提供
 * @returns 编码后的大写十六进制字符串
 * 
 * 例如：[255, 10, 15] 会被编码为 "FF0A0F"
 */
export function encodeHexUpperCase(data: Uint8Array): string {
	let result = "";
	// 遍历每个字节
	for (let i = 0; i < data.length; i++) {
		// 取字节的高4位（右移4位），并查找对应的十六进制字符
		result += alphabetUpperCase[data[i] >> 4];
		// 取字节的低4位（与0x0f做位与操作），并查找对应的十六进制字符
		result += alphabetUpperCase[data[i] & 0x0f];
	}
	return result;
}

/**
 * 将二进制数据编码为小写十六进制字符串
 * 
 * @param data - 要编码的二进制数据，以Uint8Array形式提供
 * @returns 编码后的小写十六进制字符串
 * 
 * 例如：[255, 10, 15] 会被编码为 "ff0a0f"
 */
export function encodeHexLowerCase(data: Uint8Array): string {
	let result = "";
	// 遍历每个字节
	for (let i = 0; i < data.length; i++) {
		// 取字节的高4位（右移4位），并查找对应的十六进制字符
		result += alphabetLowerCase[data[i] >> 4];
		// 取字节的低4位（与0x0f做位与操作），并查找对应的十六进制字符
		result += alphabetLowerCase[data[i] & 0x0f];
	}
	return result;
}

/**
 * 将十六进制字符串解码为二进制数据
 * 
 * @param data - 要解码的十六进制字符串（大小写均可）
 * @returns 解码后的二进制数据，以Uint8Array形式返回
 * @throws {Error} 如果输入字符串长度不是2的倍数或包含非法字符，则抛出错误
 * 
 * 例如："ff0a0F" 会被解码为 [255, 10, 15]
 */
export function decodeHex(data: string): Uint8Array {
	// 检查字符串长度是否为偶数，每两个字符表示一个字节
	if (data.length % 2 !== 0) {
		throw new Error("Invalid hex string");
	}
	// 创建用于存储结果的Uint8Array，长度为字符串长度的一半
	const result = new Uint8Array(data.length / 2);
	// 每次处理两个十六进制字符，转换为一个字节
	for (let i = 0; i < data.length; i += 2) {
		// 检查字符是否在解码映射表中
		if (!(data[i] in decodeMap)) {
			throw new Error("Invalid character");
		}
		if (!(data[i + 1] in decodeMap)) {
			throw new Error("Invalid character");
		}
		// 处理高4位（左移4位后与结果进行位或操作）
		result[i / 2] |= decodeMap[data[i]] << 4;
		// 处理低4位（直接与结果进行位或操作）
		result[i / 2] |= decodeMap[data[i + 1]];
	}
	return result;
}

/**
 * 大写十六进制字符集（0-9, A-F）
 * 用于将4位二进制值（0-15）映射为对应的十六进制字符
 */
const alphabetUpperCase = "0123456789ABCDEF";

/**
 * 小写十六进制字符集（0-9, a-f）
 * 用于将4位二进制值（0-15）映射为对应的十六进制字符
 */
const alphabetLowerCase = "0123456789abcdef";

/**
 * 十六进制字符到数字的映射表
 * 用于解码过程中将十六进制字符转换回数值
 * 支持大小写字母（a/A都映射到10，以此类推）
 */
const decodeMap: Record<string, number> = {
	"0": 0,
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	a: 10,
	A: 10,
	b: 11,
	B: 11,
	c: 12,
	C: 12,
	d: 13,
	D: 13,
	e: 14,
	E: 14,
	f: 15,
	F: 15
};
