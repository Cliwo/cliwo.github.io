---
layout: post
title:  "스프링 핵심 원리 - 기본편 완강!"
date:   2021-02-09 20:00:00 +0900
categories: Spring, Java
tags: [java, spring, study]
---

## 스프링 핵심 원리 - 기본편 완강!

### 서론  

스프링 핵심 원리, 김영한님의 강의를 완강했습니다!  
[https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B8%B0%EB%B3%B8%ED%8E%B8](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B8%B0%EB%B3%B8%ED%8E%B8)

강의 수강하면서 정리한 Notion [https://www.notion.so/Java-Spring-bc309eeec2c54613a14359ff337d146e](https://www.notion.so/Java-Spring-bc309eeec2c54613a14359ff337d146e)

![02](/assets/images/Study/Spring/2021-02-09-spring_core_basic/02.png)
<center>(Notion 정리 노트)</center> <br>


그래픽스, 게임 클라이언트 블로그에 이게 왠말이냐 싶으실 수도 있겠지만 ㅋㅋ  
뭔가 기존에 하던 분야가 아닌, 분야의 확장을 하고 싶다고 생각했고  
고민중에 생각했던 것이 **자바 스프링**이었습니다.   
주요 이유는

1. 클라이언트가 아닌, **서버 쪽**으로 넓히고 싶다.
2. **객체지향 언어**를 고르고 싶다.

**결론적으로는 정말 잘한 선택 같습니다 ㅎㅎ 두 이유를 모두 만족시키면서 공부할 수 있었습니다.**


### 무엇을 배웠나?  


![01](/assets/images/Study/Spring/2021-02-09-spring_core_basic/01.png)
<center>(목차)</center> <br>

1. **객체 지향 설계**에 대해 배웠습니다.
   1. 단순히 **SOLID**를 '이론'으로 배우는 것이 아니라, 왜 그걸 지켜야 하는지, 스프링이 SOLID를 어떻게 준수하는지 많은 예시와 설명으로 풀어서 배울 수 있었습니다.
2. **스프링 컨테이너, 빈**과 같은 스프링 개념들을 배웠습니다.
3. 스프링에서 중요한 **의존성 주입**의 방법들에 대해 배웠습니다.
   1. **자동 주입**
      1. **생성자**
      2. Setter
      3. 필드
   2. **수동 주입**
      1. **자바 class**로 설정 파일 구성
      2. xml 로 구성
4. **생명 주기 관리**를 배웠습니다.
   1. Java 공식 방식으로 관리하는 것이 권장됩니다. (스프링 부트도 이를 권장)
5. **스코프**에 대해 배웠습니다.
   1. 프로토타입 스코프에 대해 짧게 배웠지만 잘 사용되지 않는다 합니다.
   2. **웹 스코프**에 대해 배웠습니다.
6. **Test Code** 작성하는 경험을 할 수 있었습니다.
7. **롬복**과 같은 Java 진영 플러그인을 사용해볼 수 있었습니다.


### 뭐가 좋았나?


> 가장 좋았던 것은 '객체 지향'에 대해 다시 한 번 깊게 살펴볼 수 있었다는 것입니다.

왜 **SOLID를** 지켜야 하는가? **변경에는 폐쇄적이고 추가에는 개방적**이어야 하는 이유는 무엇인가? 왜 **의존성을 주입**받아야 하는가? **DIP**는 왜 따르는가? 왜 **추상에 의존하고 구체에 의존해서는 안 되는가**?  

등등의 수 많은 객체 지향 언어의 의문에 **명쾌한 해답을 얻을 수 있었습니다.**


### 했던 질문들

강의 도중 질문이 생겼을 때 댓글로 남기면 친절하게 알려주셨습니다.  
싱글톤과 DIP 위반 : [https://www.inflearn.com/questions/123791](https://www.inflearn.com/questions/123791)  
롬복과 Qualifier(여러 Bean 중 하나의 Bean을 자동 주입) : [https://www.inflearn.com/questions/145799](https://www.inflearn.com/questions/145799)

![03](/assets/images/Study/Spring/2021-02-09-spring_core_basic/03.png)
<center>(싱글톤과 DIP 위반 질문)</center> <br>

### 앞으로는?

개인적으로 아쉬웠던 것은 실전 예제 프로그램을 만들지는 않는 것이었는데, 이는 다른 "실전!-" 강의 시리즈에서 다룬다고 합니다. 아마 다음 강의는 **"실전! 스프링 부트와 JPA 활용1 - 웹 애플리케이션 개발"** 을 들을 것 같습니다.




