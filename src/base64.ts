/**
 * Base64 和 Base64url 编码与解码模块
 * 
 * Base64是一种将二进制数据转换为ASCII字符的编码方法，使用64个可打印字符表示二进制数据。
 * 基本原理是将每3个字节（24位）的数据，转换为4个可打印字符（每个6位）。
 * 
 * Base64常见应用场景：
 * - 电子邮件附件编码（MIME）
 * - 在XML或JSON中嵌入二进制数据
 * - 在URL中传输复杂数据
 * - 在HTML中嵌入图片数据（Data URL）
 * 
 * Base64url是Base64的一个变种，可用于URL和文件名等环境，用'-'和'_'替代了标准Base64中的'+'和'/'。
 */

/**
 * 标准Base64编码（带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base64字符串（带填充）
 * 
 * 例如：[72, 101, 108, 108, 111]（"Hello"）会被编码为"SGVsbG8="
 */
export function encodeBase64(bytes: Uint8Array): string {
	return encodeBase64_internal(bytes, base64Alphabet, EncodingPadding.Include);
}

/**
 * 标准Base64编码（不带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base64字符串（不带填充）
 * 
 * 例如：[72, 101, 108, 108, 111]（"Hello"）会被编码为"SGVsbG8"
 */
export function encodeBase64NoPadding(bytes: Uint8Array): string {
	return encodeBase64_internal(bytes, base64Alphabet, EncodingPadding.None);
}

/**
 * URL安全的Base64编码（带填充）
 * 使用'-'和'_'替代标准Base64中的'+'和'/'，使得编码结果可以安全用于URL参数等
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base64url字符串（带填充）
 */
export function encodeBase64url(bytes: Uint8Array): string {
	return encodeBase64_internal(bytes, base64urlAlphabet, EncodingPadding.Include);
}

/**
 * URL安全的Base64编码（不带填充）
 * 使用'-'和'_'替代标准Base64中的'+'和'/'，且不添加填充字符
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base64url字符串（不带填充）
 */
export function encodeBase64urlNoPadding(bytes: Uint8Array): string {
	return encodeBase64_internal(bytes, base64urlAlphabet, EncodingPadding.None);
}

/**
 * Base64编码的内部实现函数
 * 
 * @param bytes - 要编码的二进制数据
 * @param alphabet - 使用的Base64字母表（标准或URL安全）
 * @param padding - 是否包含填充字符"="
 * @returns 编码后的Base64字符串
 * 
 * 工作原理：
 * 1. 每次处理3个字节（24位）
 * 2. 将这24位拆分为4个6位的组
 * 3. 每个6位组映射到字母表中的一个字符
 * 4. 如果最后不足3个字节，则根据剩余位数进行适当填充
 */
function encodeBase64_internal(
	bytes: Uint8Array,
	alphabet: string,
	padding: EncodingPadding
): string {
	let result = "";
	
	// 每次处理3个字节（24位）
	for (let i = 0; i < bytes.byteLength; i += 3) {
		// 用于存储当前处理的位
		let buffer = 0;
		let bufferBitSize = 0;
		
		// 读取最多3个字节到缓冲区
		for (let j = 0; j < 3 && i + j < bytes.byteLength; j++) {
			// 将每个字节（8位）添加到缓冲区，左移8位腾出空间
			buffer = (buffer << 8) | bytes[i + j];
			bufferBitSize += 8;
		}
		
		// 每次提取6位，生成Base64字符（总共需要4个字符）
		for (let j = 0; j < 4; j++) {
			if (bufferBitSize >= 6) {
				// 提取最高的6位，映射到字母表
				result += alphabet[(buffer >> (bufferBitSize - 6)) & 0x3f];
				bufferBitSize -= 6;
			} else if (bufferBitSize > 0) {
				// 处理剩余不足6位的情况
				result += alphabet[(buffer << (6 - bufferBitSize)) & 0x3f];
				bufferBitSize = 0;
			} else if (padding === EncodingPadding.Include) {
				// 如果需要填充，添加"="字符
				result += "=";
			}
		}
	}
	return result;
}

/**
 * 标准Base64字母表
 * 包含A-Z, a-z, 0-9, +, / 共64个字符，每个字符代表6位的值（0-63）
 */
const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * URL安全的Base64字母表
 * 与标准Base64相似，但用"-"替代"+"，用"_"替代"/"，使其可用于URL等环境
 */
const base64urlAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * 解码标准Base64字符串（严格模式，要求正确的填充）
 * 
 * @param encoded - 要解码的Base64字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串格式不正确，包含无效字符或填充错误
 */
export function decodeBase64(encoded: string): Uint8Array {
	return decodeBase64_internal(encoded, base64DecodeMap, DecodingPadding.Required);
}

/**
 * 解码标准Base64字符串（宽松模式，忽略填充字符）
 * 
 * @param encoded - 要解码的Base64字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串包含无效字符
 */
export function decodeBase64IgnorePadding(encoded: string): Uint8Array {
	return decodeBase64_internal(encoded, base64DecodeMap, DecodingPadding.Ignore);
}

/**
 * 解码Base64url字符串（严格模式，要求正确的填充）
 * 
 * @param encoded - 要解码的Base64url字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串格式不正确，包含无效字符或填充错误
 */
export function decodeBase64url(encoded: string): Uint8Array {
	return decodeBase64_internal(encoded, base64urlDecodeMap, DecodingPadding.Required);
}

/**
 * 解码Base64url字符串（宽松模式，忽略填充字符）
 * 
 * @param encoded - 要解码的Base64url字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串包含无效字符
 */
export function decodeBase64urlIgnorePadding(encoded: string): Uint8Array {
	return decodeBase64_internal(encoded, base64urlDecodeMap, DecodingPadding.Ignore);
}

/**
 * Base64解码的内部实现函数
 * 
 * @param encoded - 要解码的Base64字符串
 * @param decodeMap - 字符到数值的映射表
 * @param padding - 填充处理模式（必需或忽略）
 * @returns 解码后的二进制数据
 * @throws {Error} 各种格式错误和无效字符错误
 * 
 * 工作原理：
 * 1. 每次处理4个字符（对应3个字节）
 * 2. 将每个非填充字符转换为6位，合并成24位的块
 * 3. 从24位块中提取字节（每8位一个字节）
 * 4. 处理最后不完整块的特殊情况
 */
function decodeBase64_internal(
	encoded: string,
	decodeMap: Record<string, number>,
	padding: DecodingPadding
): Uint8Array {
	// 预分配足够的空间（每4个字符最多生成3个字节）
	const result = new Uint8Array(Math.ceil(encoded.length / 4) * 3);
	let totalBytes = 0;
	
	// 每次处理4个字符（对应3个字节）
	for (let i = 0; i < encoded.length; i += 4) {
		let chunk = 0;
		let bitsRead = 0;
		
		// 处理每组中的4个字符
		for (let j = 0; j < 4; j++) {
			// 严格模式下的填充处理
			if (padding === DecodingPadding.Required && encoded[i + j] === "=") {
				continue;
			}
			
			// 宽松模式下的填充处理
			if (
				padding === DecodingPadding.Ignore &&
				(i + j >= encoded.length || encoded[i + j] === "=")
			) {
				continue;
			}
			
			// 填充字符后不应该有非填充字符
			if (j > 0 && encoded[i + j - 1] === "=") {
				throw new Error("Invalid padding");
			}
			
			// 检查是否是有效的Base64字符
			if (!(encoded[i + j] in decodeMap)) {
				throw new Error("Invalid character");
			}
			
			// 将字符转换为6位值，并放入正确的位置
			chunk |= decodeMap[encoded[i + j]] << ((3 - j) * 6);
			bitsRead += 6;
		}
		
		// 处理填充后的剩余位，检查是否正确填充
		if (bitsRead < 24) {
			let unused: number;
			// 根据读取的位数确定应该检查的位
			if (bitsRead === 12) {        // 2个字符，剩余16位未用
				unused = chunk & 0xffff;
			} else if (bitsRead === 18) { // 3个字符，剩余8位未用
				unused = chunk & 0xff;
			} else {
				throw new Error("Invalid padding");
			}
			// 确保未使用的位都是0（否则填充不正确）
			if (unused !== 0) {
				throw new Error("Invalid padding");
			}
		}
		
		// 计算这一组能生成多少个完整字节
		const byteLength = Math.floor(bitsRead / 8);
		// 从chunk中提取每个字节
		for (let i = 0; i < byteLength; i++) {
			result[totalBytes] = (chunk >> (16 - i * 8)) & 0xff;
			totalBytes++;
		}
	}
	
	// 返回实际使用的部分
	return result.slice(0, totalBytes);
}

/**
 * 编码填充选项枚举
 * - Include: 包含填充字符"="
 * - None: 不包含填充字符
 */
enum EncodingPadding {
	Include = 0,
	None
}

/**
 * 解码填充处理选项枚举
 * - Required: 要求正确的填充（严格模式）
 * - Ignore: 忽略填充错误（宽松模式）
 */
enum DecodingPadding {
	Required = 0,
	Ignore
}

/**
 * 标准Base64字符到数值的映射表
 * 将每个Base64字符映射到对应的6位值（0-63）
 */
const base64DecodeMap = {
	"0": 52, "1": 53, "2": 54, "3": 55, "4": 56,
	"5": 57, "6": 58, "7": 59, "8": 60, "9": 61,
	A: 0,  B: 1,  C: 2,  D: 3,  E: 4,  F: 5,  G: 6,  H: 7,
	I: 8,  J: 9,  K: 10, L: 11, M: 12, N: 13, O: 14, P: 15,
	Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23,
	Y: 24, Z: 25,
	a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33,
	i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41,
	q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49,
	y: 50, z: 51,
	"+": 62, "/": 63
};

/**
 * Base64url字符到数值的映射表
 * 与标准Base64映射类似，但用"-"替代"+"，用"_"替代"/"
 */
const base64urlDecodeMap = {
	"0": 52, "1": 53, "2": 54, "3": 55, "4": 56,
	"5": 57, "6": 58, "7": 59, "8": 60, "9": 61,
	A: 0,  B: 1,  C: 2,  D: 3,  E: 4,  F: 5,  G: 6,  H: 7,
	I: 8,  J: 9,  K: 10, L: 11, M: 12, N: 13, O: 14, P: 15,
	Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23,
	Y: 24, Z: 25,
	a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33,
	i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41,
	q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49,
	y: 50, z: 51,
	"-": 62, "_": 63
};
