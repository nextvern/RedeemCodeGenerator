# RedeemCodeGenerator
## Description
의사 랜덤 함수(Pseudo Random Number Generator)를 활용한 리딤 코드 제네레이터

* 12자리의 리딤코드를 생성. XXXX-XXXX-XXXX
* 리딤코드는 숫자 + 영문 (0~9, A~Z) 36자리
* 리딤코드에서 리딤번호, 리딤카운트를 구할 수 있음.
* 리딤번호 범위 : 1 ~ 46,656개
* 리딤카운트 범위 : 1 ~ 60,466,176개
* 사용된 의사 랜덤 함수(Pseudo Random Number Generator) : https://github.com/skratchdot/random-seed

## Getting Started

* ES 2015를 사용해서 작업이 되어 v5.0이상의 node를 필요로 합니다.

시작
```bash
[#] npm install
```

RedeemCode 변환을 위한 Mapping 테이블 로드 (추후 Mapping 테이블 생성 코드 추가 예정)
```javascript
const fs                  = require('fs');
const encryptDirectionMap = JSON.parse(fs.readFileSync('./cryptMap/EncryptDirectionMap.json'));
const encryptNumberMap    = JSON.parse(fs.readFileSync('./cryptMap/EncryptNumberMap.json'));
const decryptDirectionMap = JSON.parse(fs.readFileSync('./cryptMap/DecryptDirectionMap.json'));
const decryptNumberMap    = JSON.parse(fs.readFileSync('./cryptMap/DecryptNumberMap.json'));
```

RedeemCodeGenerator 로드
```javascript
const RedeemCodeGenerator = require('./RedeemCodeGenerator');
const redeemCode = new RedeemCodeGenerator('sagwangho.com', encryptDirectionMap, encryptNumberMap, decryptDirectionMap, decryptNumberMap);
```

RedeemCode 생성
```javascript
redeemCode.generate(1, 1, 100); // RedeemSrl : 1, RedeemCount : 1~100
```

RedeemCode 확인
```javascript
redeemCode.validate('64U5855NFD5H'); // { validate: true, srl: 5, cnt: 1 }
```

실행
```bash
[#] node --harmony app.js
```

## Features
* 리딤코드 자리수 추가 : 16, 20, 24
* Mapping 테이블 생성코드 추가

## License
The MIT License (MIT) Copyright (c) 2016 nextvern