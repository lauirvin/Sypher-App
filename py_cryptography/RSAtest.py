'''
Variable derivations:
n = pq
z = (p-1)(q-1)
e = 1 ~ z with no common factor to z
d = ed == 1(mod z)
c == m^e (mod n)
m == c^d (mod n)
'''

import math
import random

def isPrime(num):
    if num > 1:
        for i in range(2,num):
            if (num % i) == 0:
                return False
            else:
                return True
    return False

def RSA_keygen():
    primes = [i for i in range (10,20) if isPrime(i)]
    p = random.choice(primes)
    primes.remove(p)
    q = random.choice(primes)
    n = p * q
    z = (p-1)*(q-1)
    e_candidates = range(2,z-1)
    e = next(i for i in e_candidates if math.gcd(i, z) == 1)

    found = False
    d_candidate = 1
    while not found:
        d_candidate += z
        if d_candidate % e == 0:
            found = True
            d = d_candidate / e

    keys = open("keys.txt","w")
    keys.write(str(n) + '\n')
    keys.write(str(e) + '\n')
    keys.write(str(d).strip('.0') + '\n')

    return None

def RSA_encode(message,keys):
    keyfile = open(keys,"r")
    keylines = keyfile.readlines()

    n = int(keylines[0])
    e = int(keylines[1])
    keyfile.close()
    
    asc2_m = [ord(c) for c in message]                
    code = [((i**e) % n) for i in asc2_m]
    code_doc = open("message.txt","w")
    for i in code:
        code_doc.write(str(i))
        code_doc.write("\n")

    code_doc.close()
    return None

def RSA_decode(message,keys):
    keyfile = open(keys,"r")
    keylines = keyfile.readlines()

    n = int(keylines[0])
    d = int(keylines[2])
    keyfile.close()
    
    code_doc = open(message,"r")
    stringcode = code_doc.readlines()
    asc2_code = [int(i) for i in stringcode]
    plaintext_list = [chr(c) for c in asc2_code]
    plaintext = ''.join(plaintext_list)
    code_doc.close()
    return plaintext

if __name__ == '__main__':
    RSA_keygen()


