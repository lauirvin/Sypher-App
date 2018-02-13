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

def RSA_keygen(p,q):
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

    public = []
    public.append(e)
    public.append(n)
    private = []
    private.append(d)
    private.append(n)

    return (public,private)

def RSA_encode(message,e,n):
    asc2_m = [ord(c) for c in message]                
    code = [((i**e) % n) for i in asc2_m]
    return code

def RSA_decode(code,d,n):    
    decode_asc2 = [((i**d) % n) for i in code]
    message_list = [chr(c) for c in decode_asc2]
    message = ''.join(message_list)
    return message


