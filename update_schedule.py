from bs4 import BeautifulSoup

with open('schedule.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# 1 & 2 & 3: Fix class cards and booking links
# Find all a.ss-cal-day
for cal_day in soup.find_all('a', class_='ss-cal-day'):
    cal_day.name = 'div'
    
    # booking link should be the href
    booking_href = cal_day.get('href')
    del cal_day['href']
    
    # 2. Make the "First-time local student?" a link
    first_time_div = cal_day.find('div', class_='ss-cal-first-time')
    if first_time_div:
        # Wrap inner text in an anchor
        inner_text = first_time_div.text
        first_time_div.clear()
        
        a_link = soup.new_tag('a', href=booking_href)
        a_link['style'] = "color: inherit; text-decoration: underline; text-decoration-color: rgba(17, 106, 66, 0.4); text-underline-offset: 3px;"
        a_link.string = inner_text
        first_time_div.append(a_link)

    # 3. Add visitor label
    # "Visitor-eligible classes receive a separate “Visitors: Text Before Attending” label."
    # We'll add this to the bottom of the cal_day card
    visitor_note = soup.new_tag('div')
    visitor_note['style'] = "font-size: 0.75rem; color: var(--ss-muted); margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed var(--ss-border); text-align: center;"
    
    # It says "Visitors: Text Before Attending"
    span_v = soup.new_tag('span')
    span_v.string = "Visitors: "
    visitor_note.append(span_v)
    
    a_sms = soup.new_tag('a', href="sms:+19177368649")
    a_sms['style'] = "color: var(--ss-green); text-decoration: none;"
    a_sms.string = "Text Before Attending"
    visitor_note.append(a_sms)
    
    cal_day.append(visitor_note)

# 4. Existing students rescheduling instruction
# Add a minimalist text block just above the calendar inner
calendar_bezel = soup.find('div', class_='ss-calendar-bezel-outer')
if calendar_bezel:
    student_notice = soup.new_tag('div')
    student_notice['style'] = "text-align: right; margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--ss-muted);"
    
    student_notice.append("Current Students: Need to reschedule? ")
    
    a_resched = soup.new_tag('a', href="sms:+19177368649")
    a_resched['style'] = "color: var(--ss-green); text-decoration: none; border-bottom: 1px solid rgba(17, 106, 66, 0.2);"
    a_resched.string = "Text Sandy"
    student_notice.append(a_resched)
    
    calendar_bezel.insert_before(student_notice)

# 5. Private lesson availability links to private booking
# Since there are no private lesson blocks in the current HTML, let's add a minimalist 
# private lesson link right under the calendar bezel.
if calendar_bezel:
    private_link_div = soup.new_tag('div')
    private_link_div['style'] = "text-align: center; margin-top: 1.5rem; font-size: 0.9rem;"
    
    a_priv = soup.new_tag('a', href="/private-lessons.html")
    a_priv['style'] = "color: var(--ss-text); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--ss-border);"
    a_priv.string = "Looking for Private Lessons?"
    
    private_link_div.append(a_priv)
    calendar_bezel.insert_after(private_link_div)

# 6. No sticky CTA - ensure it's removed if it exists
sticky = soup.find('div', class_='mobile-sticky-cta')
if sticky:
    sticky.decompose()

# Clean up body class if it has body-has-sticky
body = soup.find('body')
if body and body.has_attr('class'):
    classes = body['class']
    if 'body-has-sticky' in classes:
        classes.remove('body-has-sticky')
        body['class'] = classes

with open('schedule.html', 'w', encoding='utf-8') as f:
    f.write(str(soup))
