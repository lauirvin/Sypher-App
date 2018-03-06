from hashlib import sha256
import binascii

test = 'hello there'

stuff = int.from_bytes(test.encode(), 'big')

bits = f'{stuff:b}'

print(bits)

n = int(bits, 2)
result = n.to_bytes((n.bit_length() + 7) // 8, 'big').decode()
print(result)



