"""Render offline labels from approved URLs; never write operating ledgers."""
from pathlib import Path
import csv
import json
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import HexColor

OUT = Path(__file__).resolve().parent
contact = json.loads((OUT.parents[2] / 'src/_data/contact.json').read_text())
with (OUT / 'card-urls.csv').open() as source:
    rows = list(csv.DictReader(source))

for row in rows:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(row['url'])
    qr.make(fit=True)
    qr.make_image(fill_color='black', back_color='white').save(OUT / 'qr' / (row['card_id'] + '.png'))

def render(filename, cards):
    sheet = canvas.Canvas(str(OUT / filename), pagesize=(612, 792))
    sheet.setTitle('The Shiney Ticket | ' + ('GT01 pilot' if len(cards) == 1 else 'GT01 through GT10'))
    sheet.setAuthor('Sensei Sandy BJJ')
    width, height = 85.6 * mm, 54 * mm
    left, gap = 52, 24

    def text(x, y, label, size=9, font='Helvetica', color='#302920'):
        sheet.setFillColor(HexColor(color))
        sheet.setFont(font, size)
        sheet.drawString(x, y, label)

    def panel(x, y):
        sheet.setFillColor(HexColor('#F4EFE3'))
        sheet.setStrokeColor(HexColor('#A27A36'))
        sheet.setLineWidth(.7)
        sheet.roundRect(x, y, width, height, 7, fill=1, stroke=1)

    for index, row in enumerate(cards):
        if index % 4 == 0:
            if index:
                sheet.showPage()
            text(left, 765, 'THE SHINEY TICKET | PRINT AT 100%', 12, 'Helvetica-Bold')
            text(left, 747, 'Front left. Back right. Use plain paper. Keep the other nine cards blank.', 8)
            text(left, 732, 'Each side: 85.6 x 54 mm. Check your card size before you cut.', 8)
            sheet.setStrokeColor(HexColor('#302920'))
            sheet.line(left, 34, left + inch, 34)
            sheet.line(left, 31, left, 37)
            sheet.line(left + inch, 31, left + inch, 37)
            text(left + inch + 10, 31, '1 inch scale check | Print at actual size', 8)
        y = 555 - (index % 4) * (height + 18)
        x = left
        panel(x, y)
        text(x + 14, y + height - 24, 'THE SHINEY TICKET', 16, 'Helvetica-Bold', '#164B38')
        text(x + 14, y + height - 51, 'Train with your friend.', 13, 'Helvetica-Bold')
        text(x + 14, y + height - 74, 'Four free classes in two weeks.', 11)
        text(x + 14, y + 48, 'Your first class starts day one.', 10)
        text(x + 14, y + 28, 'Sensei Sandy BJJ | Tannersville', 9)
        text(x + width - 40, y + 12, row['card_id'], 8, 'Helvetica-Bold')
        x = left + width + gap
        panel(x, y)
        text(x + 12, y + height - 20, 'Tap or scan to ask Sandy.', 11, 'Helvetica-Bold', '#164B38')
        for line_number, line in enumerate([
            'Sandy sets each class.', 'Meet him before you train.', '',
            'For a member and a', 'new adult guest.', '',
            'Fill out your waiver.', 'Use all four by day 14.'
        ]):
            text(x + 12, y + height - 39 - line_number * 10, line, 8)
        sheet.drawImage(str(OUT / 'qr' / (row['card_id'] + '.png')), x + width - 87, y + 42, width=27 * mm, height=27 * mm)
        text(x + width - 60, y + 32, row['card_id'], 8, 'Helvetica-Bold')
        text(x + 12, y + 23, 'senseisandy.com/bring-a-friend', 8)
        text(x + 12, y + 10, 'Text Sandy: ' + contact['phoneDisplay'], 8)
    sheet.save()

render('card-labels.pdf', rows)
render('shiney-ticket-GT01.pdf', rows[:1])
print('Rendered ten QR files, future label sheet, and GT01 pilot sheet. Ledgers unchanged.')
