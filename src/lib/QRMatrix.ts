import BitMatrix from "bitmatrix";
// const BitMatrix = require('bitmatrix/dist/BitMatrix.js');

class QRMatrix extends BitMatrix {
	// 辅助矩阵, 标记己填充的单元格
	markMatrix: BitMatrix;
	// typeNumber:number;
	size: number;
	constructor(size: number) {
		// if(typeNumber<1 || typeNumber > 40) throw RangeError('"typeNumber" out of range.')
		// let size = typeNumber * 4 + 17;
		super(size, size, 0);
		this.markMatrix = new BitMatrix(size, size, 0);
		Object.defineProperty(this, "size", { value: size });
	}
	// get size(){
	// 	return this.width;
	// }
	set(x: number, y: number, value) {
		super.set(x, y, !!value);
		if (value != undefined) this.mark(x, y);
	}
	has(x: number, y: number) {
		return !!this.markMatrix.get(x, y);
	}
	mark(x: number, y: number) {
		this.markMatrix.set(x, y, 1);
	}
	unmark(x: number, y: number) {
		this.markMatrix.set(x, y, 0);
	}
	setRow(row, values) {
		super.setRow(row, values);
		const o1 = this.markMatrix.getRow(row);
		const m1 = values.map((v, i) => (v === undefined ? o1[i] : 1));
		this.markMatrix.setRow(row, m1);
	}
	fillRow(row, value) {
		super.fillRow(row, value);
		if (value !== undefined) {
			this.markMatrix.fillRow(row, 1);
		}
	}
	fill(value) {
		super.fill(value);
		if (value !== undefined) {
			this.markMatrix.fill(1);
		}
	}
	clone(): QRMatrix {
		return Object.create(this, {
			_data: {
				...Object.getOwnPropertyDescriptor(this, "_data"),
				...{
					value: new Uint8Array(this._data.buffer.slice(0)),
				},
			},
			markMatrix: {
				...Object.getOwnPropertyDescriptor(this, "markMatrix"),
				...{
					value: this.markMatrix.clone(),
				},
			},
		});
	}
}

export default QRMatrix;
