/**
 * Base32 编码与解码模块
 * 
 * Base32 是一种将二进制数据编码为可打印ASCII字符的方法，使用32个不同的字符（A-Z和2-7）。
 * 它比Base64效率略低（每5个字节转换为8个字符，膨胀率为1.6），但避免了容易混淆的字符（如数字0和字母O）。
 * 
 * 基本原理：
 * 1. 将输入数据的每5个字节（40位）分割为8个5位组
 * 2. 每个5位组（取值范围0-31）映射到Base32字母表中的一个字符
 * 3. 如果最后一组不足5个字节，则用"="填充
 * 
 * Base32常用于需要人工输入的场景，如激活码、密钥等，因为它避免了容易混淆的字符。
 * 也适用于需要在文件名、URL等对大小写不敏感的环境中使用的情况。
 */

/**
 * 使用大写字母的Base32编码（带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（大写，带填充）
 * 
 * 例如：[72, 101, 108, 108, 111]（"Hello"）会被编码为"JBSWY3DP"
 */
export function encodeBase32UpperCase(bytes: Uint8Array): string {
	return encodeBase32_internal(bytes, base32UpperCaseAlphabet, EncodingPadding.Include);
}

/**
 * 使用大写字母的Base32编码（不带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（大写，不带填充）
 */
export function encodeBase32UpperCaseNoPadding(bytes: Uint8Array): string {
	return encodeBase32_internal(bytes, base32UpperCaseAlphabet, EncodingPadding.None);
}

/**
 * 使用小写字母的Base32编码（带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（小写，带填充）
 */
export function encodeBase32LowerCase(bytes: Uint8Array): string {
	return encodeBase32_internal(bytes, base32LowerCaseAlphabet, EncodingPadding.Include);
}

/**
 * 使用小写字母的Base32编码（不带填充）
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（小写，不带填充）
 */
export function encodeBase32LowerCaseNoPadding(bytes: Uint8Array): string {
	return encodeBase32_internal(bytes, base32LowerCaseAlphabet, EncodingPadding.None);
}

/**
 * 兼容性函数：使用大写字母的Base32编码（带填充）
 * 注：推荐直接使用encodeBase32UpperCase()
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（大写，带填充）
 */
export function encodeBase32(bytes: Uint8Array): string {
	return encodeBase32UpperCase(bytes);
}

/**
 * 兼容性函数：使用大写字母的Base32编码（不带填充）
 * 注：推荐直接使用encodeBase32UpperCaseNoPadding()
 * 
 * @param bytes - 要编码的二进制数据
 * @returns 编码后的Base32字符串（大写，不带填充）
 */
export function encodeBase32NoPadding(bytes: Uint8Array): string {
	return encodeBase32UpperCaseNoPadding(bytes);
}

/**
 * Base32编码的内部实现函数
 * 
 * @param bytes - 要编码的二进制数据
 * @param alphabet - 使用的Base32字母表（大写或小写）
 * @param padding - 是否包含填充字符"="
 * @returns 编码后的Base32字符串
 * 
 * 工作原理：
 * 1. 每次处理5个字节（40位）
 * 2. 将这40位拆分为8个5位的组
 * 3. 每个5位组映射到字母表中的一个字符
 * 4. 如果最后不足5个字节，则根据剩余位数进行适当填充
 */
function encodeBase32_internal(
	bytes: Uint8Array,
	alphabet: string,
	padding: EncodingPadding
): string {
	let result = "";
	// 每次处理5个字节（40位）
	for (let i = 0; i < bytes.byteLength; i += 5) {
		// 使用BigInt存储当前处理的位，因为可能需要超过32位
		let buffer = 0n;
		let bufferBitSize = 0;
		
		// 读取最多5个字节到缓冲区
		for (let j = 0; j < 5 && i + j < bytes.byteLength; j++) {
			// 将每个字节（8位）添加到缓冲区，左移8位腾出空间
			buffer = (buffer << 8n) | BigInt(bytes[i + j]);
			bufferBitSize += 8;
		}
		
		// 如果位数不是5的倍数，补齐到5的倍数（为了能正确分组）
		if (bufferBitSize % 5 !== 0) {
			buffer = buffer << BigInt(5 - (bufferBitSize % 5));
			bufferBitSize += 5 - (bufferBitSize % 5);
			}
		
		// 每次提取5位，生成Base32字符
		for (let j = 0; j < 8; j++) {
			if (bufferBitSize >= 5) {
				// 提取最高的5位，映射到字母表
				result += alphabet[Number((buffer >> BigInt(bufferBitSize - 5)) & 0x1fn)];
				bufferBitSize -= 5;
			} else if (bufferBitSize > 0) {
				// 处理剩余不足5位的情况
				result += alphabet[Number((buffer << BigInt(6 - bufferBitSize)) & 0x3fn)];
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
 * 解码Base32字符串（严格模式，要求正确的填充）
 * 
 * @param encoded - 要解码的Base32字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串格式不正确，包含无效字符或填充错误
 */
export function decodeBase32(encoded: string): Uint8Array {
	return decodeBase32_internal(encoded, base32DecodeMap, DecodingPadding.Required);
}

/**
 * 解码Base32字符串（宽松模式，忽略填充字符）
 * 
 * @param encoded - 要解码的Base32字符串
 * @returns 解码后的二进制数据
 * @throws {Error} 如果字符串包含无效字符
 */
export function decodeBase32IgnorePadding(encoded: string): Uint8Array {
	return decodeBase32_internal(encoded, base32DecodeMap, DecodingPadding.Ignore);
}

/**
 * Base32解码的内部实现函数
 * 
 * @param encoded - 要解码的Base32字符串
 * @param decodeMap - 字符到数值的映射表
 * @param padding - 填充处理模式（必需或忽略）
 * @returns 解码后的二进制数据
 * @throws {Error} 各种格式错误和无效字符错误
 * 
 * 工作原理：
 * 1. 每次处理8个字符（最多40位信息）
 * 2. 将每个非填充字符转换为5位，合并成40位的块
 * 3. 从40位块中提取字节（每8位一个字节）
 * 4. 处理最后不完整块的特殊情况
 */
function decodeBase32_internal(
	encoded: string,
	decodeMap: Record<string, number>,
	padding: DecodingPadding
): Uint8Array {
	// 预分配足够的空间（每8个字符最多生成5个字节）
	const result = new Uint8Array(Math.ceil(encoded.length / 8) * 5);
	let totalBytes = 0;
	
	// 每次处理8个字符（对应5个字节）
	for (let i = 0; i < encoded.length; i += 8) {
		let chunk = 0n;
		let bitsRead = 0;
		
		// 处理每组中的8个字符
		for (let j = 0; j < 8; j++) {
			// 严格模式下的填充处理
			if (padding === DecodingPadding.Required) {
				if (encoded[i + j] === "=") {
					continue;
				}
				if (i + j >= encoded.length) {
					throw new Error("Invalid padding");
				}
				}
			
			// 宽松模式下的填充处理
			if (padding === DecodingPadding.Ignore) {
				if (i + j >= encoded.length || encoded[i + j] === "=") {
					continue;
				}
			}
			
			// 填充字符后不应该有非填充字符
			if (j > 0 && encoded[i + j - 1] === "=") {
				throw new Error("Invalid padding");
			}
			
			// 检查是否是有效的Base32字符
			if (!(encoded[i + j] in decodeMap)) {
				throw new Error("Invalid character");
			}
			
			// 将字符转换为5位值，并放入正确的位置
			chunk |= BigInt(decodeMap[encoded[i + j]]) << BigInt((7 - j) * 5);
			bitsRead += 5;
		}
		
		// 处理填充后的剩余位，检查是否正确填充
		if (bitsRead < 40) {
			let unused: bigint;
			// 根据读取的位数确定应该检查的位
			if (bitsRead === 10) {      // 2个字符，剩余32位未用
				unused = chunk & 0xffffffffn;
			} else if (bitsRead === 20) { // 4个字符，剩余24位未用
				unused = chunk & 0xffffffn;
			} else if (bitsRead === 25) { // 5个字符，剩余16位未用
				unused = chunk & 0xffffn;
			} else if (bitsRead === 35) { // 7个字符，剩余8位未用
				unused = chunk & 0xffn;
			} else {
				throw new Error("Invalid padding");
			}
			// 确保未使用的位都是0（否则填充不正确）
			if (unused !== 0n) {
				throw new Error("Invalid padding");
			}
		}
		
		// 计算这一组能生成多少个完整字节
		const byteLength = Math.floor(bitsRead / 8);
		// 从chunk中提取每个字节
		for (let i = 0; i < byteLength; i++) {
			result[totalBytes] = Number((chunk >> BigInt(32 - i * 8)) & 0xffn);
			totalBytes++;
		}
	}
	
	// 返回实际使用的部分
	return result.slice(0, totalBytes);
}

/**
 * Base32标准字母表（大写版本）
 * 按RFC 4648标准，使用字母A-Z和数字2-7（排除0,1,8,9以避免混淆）
 */
const base32UpperCaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Base32标准字母表（小写版本）
 * 与大写版本对应的小写形式
 */
const base32LowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz234567";

/**
 * Base32解码映射表
 * 将每个Base32字符（大小写均可）映射到对应的5位值（0-31）
 */
const base32DecodeMap = {
	A: 0,  B: 1,  C: 2,  D: 3,  E: 4,  F: 5,  G: 6,  H: 7,
	I: 8,  J: 9,  K: 10, L: 11, M: 12, N: 13, O: 14, P: 15,
	Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23,
	Y: 24, Z: 25,
	a: 0,  b: 1,  c: 2,  d: 3,  e: 4,  f: 5,  g: 6,  h: 7,
	i: 8,  j: 9,  k: 10, l: 11, m: 12, n: 13, o: 14, p: 15,
	q: 16, r: 17, s: 18, t: 19, u: 20, v: 21, w: 22, x: 23,
	y: 24, z: 25,
	"2": 26, "3": 27, "4": 28, "5": 29, "6": 30, "7": 31
};

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
