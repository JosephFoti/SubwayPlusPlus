var getFeedId = function(feedId) {
  switch (feedId) {
    case 'A':
    case 'C':
    case 'E':
      return 26;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      return 1;
    case 'N':
    case 'Q':
    case 'R':
    case 'W':
      return 16;
    case 'B':
    case 'D':
    case 'F':
    case 'M':
      return 21;
    case 'L':
      return 2;
    case 'J':
    case 'Z':
      return 36;
    case 'G':
      return 31;
    case '7':
      return 51;
    case 'SIR':
      return 11;
  }
}

module.exports = {getFeedId:getFeedId}
