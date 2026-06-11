import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

// "DD-MM-YYYY" → "YYYY-MM-DD"
const parseBEDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  return `${y}-${m}-${d}`;
};

const fmt = (d) => {
  if (!d) return '--';
  const [y, m, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
};

// Returns "YYYY-MM" string for a given Date object
const toYearMonth = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export default function DateRangePickerModal({
  visible,
  onClose,
  onConfirm,
  primaryColor = '#ed3237',
  minDateFromBE,
  maxDateFromBE,
  initialStartDate = '',
  initialEndDate = '',
  secondayColor = "#ffff"
}) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setError('');
      // reset calendar month to minDate/default month
      setCurrentMonth(initialMonth);
    }
  }, [visible, initialMonth]);

  const minDate = parseBEDate(minDateFromBE); // "2026-02-10"
  const maxDate = parseBEDate(maxDateFromBE); // "2026-05-01"

  // Current displayed month starts at minDate's month
  // const initialMonth = useMemo(() => {
  //   if (!minDate) return new Date();
  //   return new Date(minDate + 'T00:00:00');
  // }, [minDate]);
  const initialMonth = useMemo(() => {
    return new Date();
  }, []);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const currentYM = toYearMonth(currentMonth);
  const minYM = minDate ? minDate.slice(0, 7) : '';
  const maxYM = maxDate ? maxDate.slice(0, 7) : '';

  const canGoBack = currentYM > minYM;
  const canGoForward = currentYM < maxYM;

  const goBack = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const goForward = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const handleDayPress = ({ dateString }) => {
    setError('');

    if (dateString < minDate || dateString > maxDate) return;

    // first selection OR reset
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate('');
      return;
    }

    // same date selected -> allow same start/end
    if (dateString === startDate) {
      setEndDate(dateString);
      return;
    }

    // earlier date replaces start
    if (dateString < startDate) {
      setStartDate(dateString);
      setEndDate('');
      return;
    }

    // later date becomes end
    setEndDate(dateString);
  };

  // const handleDayPress = ({ dateString }) => {
  //   setError('');
  //   if (dateString < minDate || dateString > maxDate) return;

  //   if (dateString === startDate && !endDate) {
  //     setStartDate('');
  //     return;
  //   }

  //   if (!startDate || (startDate && endDate)) {
  //     setStartDate(dateString);
  //     setEndDate('');
  //   } else {
  //     if (dateString <= startDate) {
  //       setStartDate(dateString);
  //       setEndDate('');
  //       return;
  //     }
  //     setEndDate(dateString);
  //   }
  // };

  const buildMarkedDates = () => {
    if (!startDate) return {};
    const marked = {};
    marked[startDate] = { startingDay: true, color: primaryColor, textColor: '#fff' };
    if (!endDate) return marked;
    let current = new Date(startDate);
    current.setDate(current.getDate() + 1);
    const end = new Date(endDate);
    while (current < end) {
      const key = current.toISOString().split('T')[0];
      marked[key] = { color: primaryColor + '44', textColor: primaryColor };
      current.setDate(current.getDate() + 1);
    }
    marked[endDate] = { endingDay: true, color: primaryColor, textColor: '#fff' };
    return marked;
  };

  const handleConfirm = () => {
    // if (!startDate || !endDate) {
    //   setError('Please select both start date and end date');
    //   return;
    // }
    onConfirm({ startDate, endDate });
    handleClose();
  };

  const handleClose = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setError('');
    setCurrentMonth(initialMonth);
    onClose();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    setCurrentMonth(initialMonth);
  };

  // Month label e.g. "February 2026"
  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          <TouchableOpacity
            onPress={handleClose}
            style={{ alignItems: 'flex-end' }}>
            <Image source={require('../../assets/Images/crossIcon.png')} style={styles.modalCrossIcon} />
          </TouchableOpacity>

          {/* Selected range display */}
          <View style={styles.rangeRow}>
            <View style={styles.rangeBox}>
              <Text style={styles.rangeLabel}>Start Date</Text>
              <Text style={[styles.rangeValue, { color: primaryColor }]}>{fmt(startDate)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: primaryColor }]} />
            <View style={styles.rangeBox}>
              <Text style={styles.rangeLabel}>End Date</Text>
              <Text style={[styles.rangeValue, { color: primaryColor }]}>{fmt(endDate)}</Text>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Custom navigation header */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={goBack}
              disabled={!canGoBack}
              style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}
            >
              <Text style={[styles.navArrow, { color: canGoBack ? primaryColor : '#ccc' }]}>{'‹'}</Text>
            </TouchableOpacity>

            <Text style={styles.monthLabel}>{monthLabel}</Text>

            <TouchableOpacity
              onPress={goForward}
              disabled={!canGoForward}
              style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]}
            >
              <Text style={[styles.navArrow, { color: canGoForward ? primaryColor : '#ccc' }]}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          {/* Single month calendar, hide built-in arrows */}
          <Calendar
            key={currentYM}
            current={`${currentYM}-01`}
            minDate={minDate}
            maxDate={maxDate}
            markingType="period"
            markedDates={buildMarkedDates()}
            onDayPress={handleDayPress}
            hideArrows={true}
            disableMonthChange={true}
            theme={{
              selectedDayBackgroundColor: primaryColor,
              todayTextColor: primaryColor,
              monthTextColor: 'transparent', // hidden — we show our own header
              textMonthFontSize: 1,
              textDayFontSize: 13,
              calendarBackground: '#fff',
              dayTextColor: '#333',
              textDisabledColor: '#d9d9d9',
            }}
            style={styles.calendar}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity onPress={handleClear} style={[styles.btn, { borderColor: primaryColor }]}>
              <Text style={[styles.btnText, { color: primaryColor }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.btn, { backgroundColor: primaryColor, borderColor: primaryColor }]}>
              <Text style={[styles.btnText, { color: secondayColor }]}>Confirm</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff', borderRadius: 16,
    width: width * 0.92, padding: 16, elevation: 10,
  },
  rangeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rangeBox: { flex: 1, alignItems: 'center' },
  rangeLabel: { fontSize: 11, color: '#888' },
  rangeValue: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  divider: { width: 1, height: 30, marginHorizontal: 8 },
  errorText: { color: 'red', fontSize: 12, textAlign: 'center', marginBottom: 6 },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 4,
  },
  navBtn: { padding: 8 },
  navBtnDisabled: { opacity: 0.4 },
  navArrow: { fontSize: 28, fontWeight: 'bold', lineHeight: 30 },
  monthLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  calendar: { borderRadius: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: {
    flex: 1, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  btnText: { fontSize: 14, fontWeight: '600' },
  modalCrossIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#555555',
  },
});
