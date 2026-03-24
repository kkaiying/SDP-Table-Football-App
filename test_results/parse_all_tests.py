import re
import math

def parse_test_data(file_path, test_name):
    """Extract values for a specific test type"""
    with open(file_path, 'r') as f:
        content = f.read()
        pattern = rf'\[{test_name}\]\s*([\d.]+)ms'
        matches = re.findall(pattern, content)
        return [float(x) for x in matches]

def parse_ball_positions(file_path):
    """Extract x,y coordinates for consistency test"""
    with open(file_path, 'r') as f:
        content = f.read()
        pattern = r'\[BALL_POSITION_CONSISTENCY\]\s*x=([\d.]+),\s*y=([\d.]+)'
        matches = re.findall(pattern, content)
        return [(float(x), float(y)) for x, y in matches]

def parse_packet_sequence(file_path):
    """Extract packet sequence numbers"""
    with open(file_path, 'r') as f:
        content = f.read()
        pattern = r'\[PACKET_COUNT\]\s*(\d+)'
        matches = re.findall(pattern, content)
        return [int(x) for x in matches]

def create_frequency_table(values, bins_config):
    """Create frequency distribution based on bin configuration"""
    bins = {key: 0 for key in bins_config.keys()}

    for value in values:
        for bin_range, (min_val, max_val) in bins_config.items():
            if max_val is None:  # For "X+" bins
                if value >= min_val:
                    bins[bin_range] += 1
                    break
            elif min_val <= value <= max_val:
                bins[bin_range] += 1
                break

    return bins

def print_results(test_name, bins):
    """Print formatted frequency table"""
    print(f"\n{'='*40}")
    print(f"{test_name}")
    print('='*40)
    print(f"{'Range (ms)':<15} | {'Frequency':>10}")
    print('-'*40)

    for bin_range, frequency in bins.items():
        print(f"{bin_range:<15} | {frequency:>10}")

    print('='*40)

def analyze_consistency(positions):
    """Analyze ball position consistency"""
    if not positions:
        return None

    x_vals = [x for x, y in positions]
    y_vals = [y for x, y in positions]

    mean_x = sum(x_vals) / len(x_vals)
    mean_y = sum(y_vals) / len(y_vals)

    variance_x = sum((x - mean_x) ** 2 for x in x_vals) / len(x_vals)
    variance_y = sum((y - mean_y) ** 2 for y in y_vals) / len(y_vals)

    std_x = math.sqrt(variance_x)
    std_y = math.sqrt(variance_y)

    # Calculate max deviation from mean
    deviations = [math.sqrt((x - mean_x)**2 + (y - mean_y)**2) for x, y in positions]
    max_dev = max(deviations)

    return {
        'count': len(positions),
        'mean_x': mean_x,
        'mean_y': mean_y,
        'std_x': std_x,
        'std_y': std_y,
        'max_deviation': max_dev
    }

def print_consistency_results(stats):
    """Print consistency analysis results"""
    print(f"\n{'='*40}")
    print("BALL_POSITION_CONSISTENCY")
    print('='*40)
    print(f"Samples:          {stats['count']}")
    print(f"Average Position: ({stats['mean_x']:.2f}, {stats['mean_y']:.2f})")
    print(f"Std Dev X:        ±{stats['std_x']:.2f} pixels")
    print(f"Std Dev Y:        ±{stats['std_y']:.2f} pixels")
    print(f"Max Deviation:    {stats['max_deviation']:.2f} pixels")
    print('='*40)

def analyze_packet_loss(sequence_nums):
    """Analyze packet delivery and loss"""
    if not sequence_nums:
        return None

    received_count = len(sequence_nums)
    min_seq = min(sequence_nums)
    max_seq = max(sequence_nums)
    expected_count = max_seq - min_seq + 1

    # Find missing packets
    expected_set = set(range(min_seq, max_seq + 1))
    received_set = set(sequence_nums)
    missing = sorted(expected_set - received_set)

    lost_count = len(missing)
    delivery_rate = (received_count / expected_count) * 100 if expected_count > 0 else 0
    loss_rate = (lost_count / expected_count) * 100 if expected_count > 0 else 0

    return {
        'received': received_count,
        'expected': expected_count,
        'lost': lost_count,
        'delivery_rate': delivery_rate,
        'loss_rate': loss_rate,
        'missing_packets': missing[:10]  # Show first 10 missing
    }

def print_packet_loss_results(stats):
    """Print packet loss analysis results"""
    print(f"\n{'='*40}")
    print("PACKET_COUNT (Message Delivery)")
    print('='*40)
    print(f"Packets Received: {stats['received']}")
    print(f"Packets Expected: {stats['expected']}")
    print(f"Packets Lost:     {stats['lost']}")
    print(f"Delivery Rate:    {stats['delivery_rate']:.2f}%")
    print(f"Loss Rate:        {stats['loss_rate']:.2f}%")
    if stats['missing_packets']:
        print(f"Missing (sample): {stats['missing_packets']}")
    print('='*40)

# Configuration for different test types
test_configs = {
    'BALL_MOVEMENT_LATENCY': {
        'bins': {
            '1': (1, 1.99),
            '2': (2, 2.99),
            '3': (3, 3.99),
            '4': (4, 4.99),
            '5': (5, 5.99),
            '6': (6, 6.99),
            '6+': (7, None)
        }
    },
    'BALL_UPDATE_RATE': {
        'bins': {
            '0-20': (0, 20),
            '21-40': (21, 40),
            '41-60': (41, 60),
            '61-80': (61, 80),
            '80+': (80, None)
        }
    },
    'KEYDOWN_RESPONSE': {
        'bins': {
            '0-0.5': (0, 0.5),
            '0.6-1.0': (0.6, 1.0),
            '1.1-2.0': (1.1, 2.0),
            '2.1-5.0': (2.1, 5.0),
            '5.0+': (5.0, None)
        }
    }
}

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python parse_all_tests.py <test_file.txt>")
        print("\nExample:")
        print("  python parse_all_tests.py ball_update_rate.txt")
        print("  python parse_all_tests.py all_tests.txt")
        sys.exit(1)

    input_file = sys.argv[1]

    # Create output filename
    output_file = input_file.replace('.log', '_results.txt')

    # Redirect print to both console and file
    import sys
    class Tee:
        def __init__(self, *files):
            self.files = files
        def write(self, obj):
            for f in self.files:
                f.write(obj)
                f.flush()
        def flush(self):
            for f in self.files:
                f.flush()

    with open(output_file, 'w') as f:
        original_stdout = sys.stdout
        sys.stdout = Tee(sys.stdout, f)

        # Check for consistency test
        positions = parse_ball_positions(input_file)
        if positions:
            stats = analyze_consistency(positions)
            print_consistency_results(stats)

        # Check for packet loss test
        sequence_nums = parse_packet_sequence(input_file)
        if sequence_nums:
            stats = analyze_packet_loss(sequence_nums)
            print_packet_loss_results(stats)

        # Process all other tests
        for test_name, config in test_configs.items():
            values = parse_test_data(input_file, test_name)

            if values:
                bins = create_frequency_table(values, config['bins'])
                print_results(test_name, bins)
            else:
                print(f"\n[{test_name}] No data found")

        sys.stdout = original_stdout
        print(f"\nResults saved to: {output_file}")
