import redis    
import time                                                                             

r = redis.Redis(host='localhost', port=6379, db=0)                                      
r.set("opp_gk_position", 1.0)
r.set("opp_defence_position", 0.8)                                                      
r.set("opp_midfield_position", 0.9)                                                     
r.set("opp_striker_position", 0.0) 