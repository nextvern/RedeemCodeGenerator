"use strict";
const fs               = require('fs');
const prng             = require('random-seed');
const serialMidNumber  = Math.pow(36, 3) / 2;
const countMidNumber   = Math.pow(36, 8) / 2;
const countNumberMax   = Math.pow(36, 5);
const countNumberRange = Math.pow(36, 3);
const chunkRange       = Math.pow(36, 1);
const keyMap           = {'0' : 0, '1' : 1, '2' : 2, '3' : 3, '4' : 4, '5' : 5, '6' : 6, '7' : 7, '8' : 8, '9' : 9, 'A' : 10, 'B' : 11, 'C' : 12, 'D' : 13, 'E' : 14, 'F' : 15, 'G' : 16, 'H' : 17, 'I' : 18, 'J' : 19, 'K' : 20, 'L' : 21, 'M' : 22, 'N' : 23, 'O' : 24, 'P' : 25, 'Q' : 26, 'R' : 27, 'S' : 28, 'T' : 29, 'U' : 30, 'V' : 31, 'W' : 32, 'X' : 33, 'Y' : 34, 'Z' : 35};
const strMap           = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const RedeemCodeGenerator = class {
  constructor( $company, $encryptDirectionMap, $encryptNumberMap, $decryptDirectionMap, $decryptNumberMap ) {
    this._company             = $company;
    this._encryptDirectionMap = $encryptDirectionMap;
    this._encryptNumberMap    = $encryptNumberMap;
    this._decryptDirectionMap = $decryptDirectionMap;
    this._decryptNumberMap    = $decryptNumberMap;
  }

  generate( $srl, $startLength, $endLength ) {
    const checkPrng            = prng.create(this._company + 'chk' + $srl);
    const countPrng            = prng.create(this._company + 'cnt' + $srl);
    let srl                    = $srl % 2 ? serialMidNumber + ($srl + 1) / 2 : serialMidNumber - $srl / 2;
    let couponCount            = 1;
    let checkRandomNumberUpCnt = 0;
    let checkRandomNumberDnCnt = 0;
    let result                 = [];

    for (let i = 1; i <= $endLength; i++) {
      let checkRandomNumber = checkPrng(chunkRange);
      let countRandomNumber = countPrng(countNumberRange);
      let cnt               = 0;

      if (checkRandomNumber % 2) {
        ++checkRandomNumberUpCnt;
        cnt = countMidNumber + checkRandomNumberUpCnt * countNumberRange + countRandomNumber;
      } else {
        ++checkRandomNumberDnCnt;
        cnt = countMidNumber - checkRandomNumberDnCnt * countNumberRange + countRandomNumber;
      }

      if ($startLength <= couponCount) {
        let _chk = strMap[checkRandomNumber];
        let _srl = this.numberToStr(srl, '', this._encryptNumberMap[checkRandomNumber]);
        let _cnt = this.numberToStr(cnt, '', this._encryptNumberMap[checkRandomNumber]);
        let _enc = _chk + this.rangeToStr(_srl, this._encryptNumberMap[checkRandomNumber][0], 3) + this.rangeToStr(_cnt, this._encryptNumberMap[checkRandomNumber][0], 8);

        let _rep = this.reDirection(_enc, checkRandomNumber, this._encryptDirectionMap);
        result.push(_rep);
      }

      couponCount++;
    }

    return result;
  }

  validate( $redeemCode ) {
    const result = {
      validate : false,
      srl      : 0,
      cnt      : 0
    };

    let _chk = keyMap[$redeemCode.substring(0, 1)];
    let _rep = this.reDirection($redeemCode, _chk, this._decryptDirectionMap);
    let _srl = this.strToNumber(_rep.substring(1, 4), this._decryptNumberMap[_chk]);
    let srl  = _srl - serialMidNumber > 0 ? Math.abs(_srl - serialMidNumber) * 2 - 1 : Math.abs(_srl - serialMidNumber) * 2;
    let cnt  = this.validateCnt(_chk, srl, this.strToNumber(_rep.substring(4, 12), this._decryptNumberMap[_chk]), countNumberMax);

    result.validate = cnt ? true : false;
    result.srl      = srl;
    result.cnt      = cnt;
    return result;
  }

  reDirection( $coupon, $checkNumber, $cryptDirectionMap ) {
    return $coupon.split('').map(( c, i, a )=> {
      return a[$cryptDirectionMap[$checkNumber][i]];
    }).join('');
  }

  validateCnt( $chk, $srl, $number, $length ) {
    const checkPrng            = prng.create(this._company + 'chk' + $srl);
    const countPrng            = prng.create(this._company + 'cnt' + $srl);
    let couponCount            = 1;
    let checkRandomNumberUpCnt = 0;
    let checkRandomNumberDnCnt = 0;

    for (let i = 1; i <= $length; i++) {
      let checkRandomNumber = checkPrng(chunkRange);
      let countRandomNumber = countPrng(countNumberRange);
      let coupon            = 0;

      if (checkRandomNumber % 2) {
        ++checkRandomNumberUpCnt;
        coupon = countMidNumber + checkRandomNumberUpCnt * countNumberRange + countRandomNumber;
      } else {
        ++checkRandomNumberDnCnt;
        coupon = countMidNumber - checkRandomNumberDnCnt * countNumberRange + countRandomNumber;
      }

      if (coupon == $number && $chk == checkRandomNumber) {
        return couponCount;
      }
      couponCount++;
    }
    return 0;
  }

  strToNumber( $str, $keymap ) {
    let result = 0;
    for (let i = 0; i < $str.length; ++i) {
      let num = $keymap[$str.substring(i, i + 1)];
      if (i == $str.length - 1) {
        result += num;
      } else {
        result += Math.pow(36, $str.length - i - 1) * num;
      }
    }
    return result;
  }

  numberToStr( $number, $str, $numMap ) {
    var floor = Math.floor($number / $numMap.length);
    var mod   = $number % $numMap.length;
    return floor == 0 ? $str = $numMap[mod] + $str : this.numberToStr(floor, $str = $numMap[mod] + $str, $numMap);
  }

  rangeToStr( $str, $prepend, $length ) {
    return $prepend.repeat($length - $str.length) + $str;
  }
};

module.exports = RedeemCodeGenerator;