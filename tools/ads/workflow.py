"""Create an optional local task brief; never sends, publishes, or schedules."""
import argparse,json
from pathlib import Path

def brief(data):
    lines=['# SSBJJ task brief','', 'These are planning inputs, not measured campaign results.','']
    for item in data['questions']:
        if item['persona_id'] not in {'carla','ben','tyler','casey','frankie','wendy'}:
            raise ValueError('Use a buyer persona; Ian is an experience lens.')
        lines.extend([f"## {item['persona_id']}: {item['question']}",f"- Stage: {item['stage']}; evidence: {item['evidence']}",f"- Answer to verify: {item['answer']}",f"- Capture: {item['proof_needed']}",'- First check whether an existing asset, page correction or personal answer resolves this. Produce an ad only if needed.','- Review: current offer, photo permission, matching destination, one clear CTA.',''])
    lines.extend(['## Decision', '- Reuse, answer personally, fix the page, or produce one concept.', '- Review current offer, asset permission, readability and destination.', '- If testing an ad, record time spent, corrections, attributed attended visits and enrollments. Unknown attribution stays unknown.'])
    return '\n'.join(lines)+'\n'

ROOT = Path(__file__).resolve().parent

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--input',default=str(ROOT/'workflow-input.json'))
    p.add_argument('--output',default='task-brief.md')
    a=p.parse_args()
    input_path = Path(a.input) if Path(a.input).is_file() else ROOT / a.input
    output=Path(a.output)
    content=brief(json.loads(input_path.read_text()))
    with output.open('x') as f:f.write(content)
    print(output.resolve())
