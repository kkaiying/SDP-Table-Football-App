import re
import matplotlib.pyplot as plt

with open('ballMovementLatency.txt', 'r') as f:
    content = f.read()
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    latencies = [float(x) for x in re.findall(r'Latency:\s*([\d.]+)ms', content)]

bins = {'1-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '20+': 0}

for latency in latencies:
    if 1 <= latency <= 5:
        bins['1-5'] += 1
    elif 6 <= latency <= 10:
        bins['6-10'] += 1
    elif 11 <= latency <= 15:
        bins['11-15'] += 1
    elif 16 <= latency <= 20:
        bins['16-20'] += 1
    else:
        bins['20+'] += 1

print("Latency (ms),Frequency")
for bin_range, frequency in bins.items():
    print(f"{bin_range},{frequency}")

# bar chart 
plt.bar(bins.keys(), bins.values())
plt.xlabel('Latency (ms)')
plt.ylabel('Frequency')
plt.savefig('ballMovementLatency.png')
plt.show()