import BitBuffer from '../lib/BitBuffer'
export interface mode{
	getMode():number;
	getLength():number;
	write(bit:BitBuffer);
}