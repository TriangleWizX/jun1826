#!/usr/bin/env python3
"""Aggregate the attendance workbook without emitting student-level data."""
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta
from statistics import mean, median

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def profile(path):
    archive = zipfile.ZipFile(path)
    shared_root = ET.fromstring(archive.read('xl/sharedStrings.xml'))
    shared = [''.join(t.text or '' for t in item.findall('.//m:t', NS)) for item in shared_root.findall('m:si', NS)]

    def value(cell):
        node = cell.find('m:v', NS)
        raw = '' if node is None else node.text
        return shared[int(raw)] if cell.attrib.get('t') == 's' and raw else raw

    def rows(sheet, marks_column, sessions_column):
        root = ET.fromstring(archive.read(f'xl/worksheets/sheet{sheet}.xml'))
        output = []
        for row in root.findall('.//m:sheetData/m:row', NS)[1:]:
            cells = {cell.attrib.get('r', '').rstrip('0123456789'): value(cell) for cell in row.findall('m:c', NS)}
            try:
                observed = datetime(1899, 12, 30) + timedelta(days=float(cells['A']))
                sessions = int(float(cells.get(sessions_column, '0') or 0))
                marks = int(float(cells.get(marks_column, '0') or 0))
            except (KeyError, TypeError, ValueError):
                continue
            if sessions and str(cells.get('C', '')).lower() != 'no class':
                output.append((observed.date(), marks))
        return output

    start, end = date(2025, 8, 4), date(2026, 8, 3)
    teens = [(day, marks) for day, marks in rows(1, 'Q', 'S') if start <= day <= end]
    adults = [(day, marks) for day, marks in rows(2, 'AD', 'AE') if start <= day <= end]
    kids = [(day, marks) for day, marks in rows(4, 'AD', 'AF') if start <= day <= end]
    youth_by_date = {}
    for day, marks in teens + kids:
        youth_by_date[day] = youth_by_date.get(day, 0) + marks
    observations = [marks for _, marks in adults] + list(youth_by_date.values())
    ordered = sorted(observations)
    percentile = lambda fraction: ordered[min(len(ordered) - 1, int((len(ordered) - 1) * fraction))]
    return {
        'source': path,
        'period': {'start': start.isoformat(), 'end': end.isoformat()},
        'observations': len(ordered),
        'adultSessions': len(adults),
        'youthTeenRows': len(teens),
        'kidsRows': len(kids),
        'deduplicatedYouthSessions': len(youth_by_date),
        'attendanceMarks': sum(ordered),
        'medianClassSize': median(ordered),
        'p25ClassSize': percentile(0.25),
        'p75ClassSize': percentile(0.75),
        'minimumClassSize': min(ordered),
        'maximumClassSize': max(ordered),
        'meanClassSize': round(mean(ordered), 3),
        'note': 'Median is the public measure; attendance is operational evidence and does not imply student outcomes.'
    }


if __name__ == '__main__':
    workbook = sys.argv[1] if len(sys.argv) > 1 else 'assets/attendance_reconciled_updated_manual_entry.xlsx'
    print(json.dumps(profile(workbook), indent=2))
