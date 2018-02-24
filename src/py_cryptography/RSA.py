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
import pickle

def isPrime(num):
    if num == 2:
        return True
    if num < 2 or num % 2 == 0:
        return False
    for n in range(3,int(num**0.5)+2,2):
            if (num % n) == 0:
                return False            
    return True

def euclid_extended():
    pass

def RSA_keygen():
    primes = [i for i in range (900000,1000000) if isPrime(i)]
    p = random.choice(primes)
    primes.remove(p)
    q = random.choice(primes)
    n = p * q
    z = (p-1)*(q-1)
    e = 257

    #replace this with euclid's extended algorithm to find d
    found = False
    d_candidate = 1
    while not found:
        d_candidate += z
        if d_candidate % e == 0:
            found = True
            d = int(d_candidate / e)

    pubkey = (n,e)
    privkey = (n,d)

    with open("public.b","wb") as f:
        pickle.dump(pubkey,f)

    with open("private.b","wb") as f:
        pickle.dump(privkey,f)

    return None

def RSA_encode(message,keys):
    with open(keys,"rb") as f:
        key_tup = pickle.load(f)

    n,e = key_tup
                    
    code = [pow(ord(i),e,n) for i in message]
    with open("message.txt","wb") as f:
        pickle.dump(code,f)
    
    return None

def RSA_decode(message,keys):
    with open(keys,"rb") as f:
        key_tup = pickle.load(f)

    n,d = key_tup  

    with open(message,"rb") as f:
        code = pickle.load(f)  
    
    plaintext_list = [chr(pow(i,d,n)) for i in code]
    plaintext = ''.join(plaintext_list)    
    return plaintext

if __name__ == '__main__':
    RSA_keygen()


