from hashlib import sha256
import binascii
from random import SystemRandom

errors = 'surrogatepass'

def text_to_bits(message,encoding = 'utf-8'):
	int_bits = int.from_bytes(message.encode(encoding,errors), 'big')
	bits = f'{int_bits:b}'
	return bits.zfill(8 * ((len(bits) + 7) // 8))

def bits_to_text(bits, encoding = 'utf-8'):
	n = int(bits, 2)
	return n.to_bytes((n.bit_length() + 7) // 8, 'big').decode('utf-8',errors).rstrip(' \t\r\n\0')

def pad(message, k0 = 256, n = 1024):
	'''Create 2 oracles using sha-256 hashing algorithm'''
	oracle1 = sha256()
	oracle2 = sha256()

	'''Generate a random bit-string of length k0'''
	rand_bits = format(SystemRandom().getrandbits(k0), '0256b')

	'''convert message to binary'''
	bitmsg = text_to_bits(message)

	'''ensure that bitmsg is of length n - k0 bits'''
	if len(bitmsg) <= (n - k0):
		k1 = n - k0 - len(bitmsg)
		bitmsg = bitmsg + ('0' * k1)

	'''apply hashing oracles as required'''

	oracle1.update(rand_bits.encode('utf-8'))
	x = format(int(bitmsg , 2) ^ int(oracle1.hexdigest(), 16), '0768b')	
	
	oracle2.update(x.encode('utf-8'))
	y = format(int(oracle2.hexdigest(), 16) ^ int(rand_bits, 2), '0256b')

	return x + y

def unpad(message, k0 = 256):
	oracle1 = sha256()
	oracle2 = sha256()

	x = message[0:768]
	y = message[768:]

	oracle2.update(x.encode('utf-8'))
	r = format(int(y,2) ^ int(oracle2.hexdigest(), 16), '0256b')

	oracle1.update(r.encode('utf-8'))
	msg = format(int(x,2) ^ int(oracle1.hexdigest(), 16), '0768b')

	return bits_to_text(msg)

padded = pad('hello there')
unpadded = unpad(padded)
print(unpadded)