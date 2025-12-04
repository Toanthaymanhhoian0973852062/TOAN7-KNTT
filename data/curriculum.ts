import { Chapter } from '../types';

export const CURRICULUM: Chapter[] = [
  {
    id: 'chap1',
    title: 'Chương I: Số hữu tỉ',
    lessons: [
      { id: 'l1.1', title: 'Bài 1: Tập hợp các số hữu tỉ', chapterId: 'chap1' },
      { id: 'l1.2', title: 'Bài 2: Cộng, trừ, nhân, chia số hữu tỉ', chapterId: 'chap1' },
      { id: 'l1.3', title: 'Bài 3: Lũy thừa với số mũ tự nhiên của một số hữu tỉ', chapterId: 'chap1' },
      { id: 'l1.4', title: 'Bài 4: Thứ tự thực hiện các phép tính. Quy tắc chuyển vế', chapterId: 'chap1' },
      { id: 'l1.final', title: 'Bài tập cuối Chương I', chapterId: 'chap1' },
    ]
  },
  {
    id: 'chap2',
    title: 'Chương II: Số thực',
    lessons: [
      { id: 'l2.5', title: 'Bài 5: Làm quen với số thập phân vô hạn tuần hoàn', chapterId: 'chap2' },
      { id: 'l2.6', title: 'Bài 6: Số vô tỉ. Căn bậc hai số học', chapterId: 'chap2' },
      { id: 'l2.7', title: 'Bài 7: Tập hợp các số thực', chapterId: 'chap2' },
      { id: 'l2.final', title: 'Bài tập cuối Chương II', chapterId: 'chap2' },
    ]
  },
  {
    id: 'chap3',
    title: 'Chương III: Góc và đường thẳng song song',
    lessons: [
      { id: 'l3.8', title: 'Bài 8: Góc ở vị trí đặc biệt. Tia phân giác của một góc', chapterId: 'chap3' },
      { id: 'l3.9', title: 'Bài 9: Hai đường thẳng song song và dấu hiệu nhận biết', chapterId: 'chap3' },
      { id: 'l3.10', title: 'Bài 10: Tiên đề Euclid. Tính chất của hai đường thẳng song song', chapterId: 'chap3' },
      { id: 'l3.11', title: 'Bài 11: Định lí và chứng minh định lí', chapterId: 'chap3' },
      { id: 'l3.final', title: 'Bài tập cuối Chương III', chapterId: 'chap3' },
    ]
  },
  {
    id: 'chap4',
    title: 'Chương IV: Tam giác bằng nhau',
    lessons: [
      { id: 'l4.12', title: 'Bài 12: Tổng các góc trong một tam giác', chapterId: 'chap4' },
      { id: 'l4.13', title: 'Bài 13: Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất (c.c.c)', chapterId: 'chap4' },
      { id: 'l4.14', title: 'Bài 14: Trường hợp bằng nhau thứ hai (c.g.c) và thứ ba (g.c.g)', chapterId: 'chap4' },
      { id: 'l4.15', title: 'Bài 15: Các trường hợp bằng nhau của tam giác vuông', chapterId: 'chap4' },
      { id: 'l4.16', title: 'Bài 16: Tam giác cân. Đường trung trực của đoạn thẳng', chapterId: 'chap4' },
      { id: 'l4.final', title: 'Bài tập cuối Chương IV', chapterId: 'chap4' },
    ]
  },
  {
    id: 'chap5',
    title: 'Chương V: Thu thập và biểu diễn dữ liệu',
    lessons: [
      { id: 'l5.17', title: 'Bài 17: Thu thập và phân loại dữ liệu', chapterId: 'chap5' },
      { id: 'l5.18', title: 'Bài 18: Biểu đồ hình quạt tròn', chapterId: 'chap5' },
      { id: 'l5.19', title: 'Bài 19: Biểu đồ đoạn thẳng', chapterId: 'chap5' },
      { id: 'l5.final', title: 'Bài tập cuối Chương V', chapterId: 'chap5' },
    ]
  },
  {
    id: 'chap6',
    title: 'Chương VI: Tỉ lệ thức và đại lượng tỉ lệ',
    lessons: [
      { id: 'l6.20', title: 'Bài 20: Tỉ lệ thức', chapterId: 'chap6' },
      { id: 'l6.21', title: 'Bài 21: Tính chất của dãy tỉ số bằng nhau', chapterId: 'chap6' },
      { id: 'l6.22', title: 'Bài 22: Đại lượng tỉ lệ thuận', chapterId: 'chap6' },
      { id: 'l6.23', title: 'Bài 23: Đại lượng tỉ lệ nghịch', chapterId: 'chap6' },
      { id: 'l6.final', title: 'Bài tập cuối Chương VI', chapterId: 'chap6' },
    ]
  },
  {
    id: 'chap7',
    title: 'Chương VII: Biểu thức đại số và đa thức một biến',
    lessons: [
      { id: 'l7.24', title: 'Bài 24: Biểu thức đại số', chapterId: 'chap7' },
      { id: 'l7.25', title: 'Bài 25: Đa thức một biến', chapterId: 'chap7' },
      { id: 'l7.26', title: 'Bài 26: Phép cộng và phép trừ đa thức một biến', chapterId: 'chap7' },
      { id: 'l7.27', title: 'Bài 27: Phép nhân đa thức một biến', chapterId: 'chap7' },
      { id: 'l7.28', title: 'Bài 28: Phép chia đa thức một biến', chapterId: 'chap7' },
      { id: 'l7.final', title: 'Bài tập cuối Chương VII', chapterId: 'chap7' },
    ]
  },
  {
    id: 'chap8',
    title: 'Chương VIII: Làm quen với các hình khối',
    lessons: [
      { id: 'l8.29', title: 'Bài 29: Làm quen với hình hộp chữ nhật, hình lập phương', chapterId: 'chap8' },
      { id: 'l8.30', title: 'Bài 30: Làm quen với hình lăng trụ đứng tam giác và lăng trụ đứng tứ giác', chapterId: 'chap8' },
      { id: 'l8.final', title: 'Bài tập cuối Chương VIII', chapterId: 'chap8' },
    ]
  },
  {
    id: 'chap9',
    title: 'Chương IX: Tam giác',
    lessons: [
      { id: 'l9.31', title: 'Bài 31: Quan hệ giữa góc và cạnh đối diện trong một tam giác', chapterId: 'chap9' },
      { id: 'l9.32', title: 'Bài 32: Quan hệ giữa đường vuông góc và đường xiên', chapterId: 'chap9' },
      { id: 'l9.33', title: 'Bài 33: Quan hệ giữa ba cạnh của một tam giác', chapterId: 'chap9' },
      { id: 'l9.34', title: 'Bài 34: Sự đồng quy của ba đường trung tuyến, ba đường phân giác', chapterId: 'chap9' },
      { id: 'l9.35', title: 'Bài 35: Sự đồng quy của ba đường trung trực, ba đường cao', chapterId: 'chap9' },
      { id: 'l9.final', title: 'Bài tập cuối Chương IX', chapterId: 'chap9' },
    ]
  },
  {
    id: 'chap10',
    title: 'Chương X: Một số hình khối trong thực tiễn',
    lessons: [
      { id: 'l10.36', title: 'Bài 36: Hình hộp chữ nhật và hình lập phương', chapterId: 'chap10' },
      { id: 'l10.37', title: 'Bài 37: Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác', chapterId: 'chap10' },
      { id: 'l10.final', title: 'Bài tập cuối Chương X', chapterId: 'chap10' },
    ]
  }
];

// Helper to get next lesson ID
export const getNextLessonId = (currentId: string): string | null => {
  const allLessons = CURRICULUM.flatMap(c => c.lessons);
  const index = allLessons.findIndex(l => l.id === currentId);
  if (index >= 0 && index < allLessons.length - 1) {
    return allLessons[index + 1].id;
  }
  return null;
};