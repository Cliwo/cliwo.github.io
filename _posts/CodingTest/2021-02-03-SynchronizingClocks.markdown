---
layout: post
title:  "Synchronizing Clocks (Cpp)"
date:   2021-02-03 13:40:00 +0900
categories: CodingTest
tags: [codingtest, cpp, bruteforce]
---

## Synchronizing Clocks

문제 링크 : [https://algospot.com/judge/problem/read/CLOCKSYNC](https://algospot.com/judge/problem/read/CLOCKSYNC) 

![01](/assets/images/CodingTests/2021-02-03-SynchronizingClocks/01.png/)

완전 탐색 (Brute force) 방식은 크게
1. 그냥 for문으로 돌리기
2. 재귀로 (실행 느림)
3. 순열
4. 비트마스크

위의 4종류라고 한다. 

**순열**에 해당하는 문제의 예시는 이전에 풀었던 프로그래머스의 '소수 찾기' 문제가 있었다. [https://programmers.co.kr/learn/courses/30/lessons/42839](https://programmers.co.kr/learn/courses/30/lessons/42839)

이번에는 **비트마스크**를 사용하는 문제였다.
문제 풀면서 핵심은 **현재 시계들의 상태를 결국 하나의 key**로 사용하는데, 이 **key를 string으로 저장하면 느려진다**는 것이다.  

처음에는 "0000 0000 0000 0000" ~ "3333 3333 3333 3333" 처럼 16개의 시계의 상태를 문자열로 표현했는데 이렇게 하니까 너무 느렸다. 이 후 **32개의 bit로 하나의 시계당 4개의 bit를 줘서 int** 하나로 표현했다. 즉, 각 시계의 상태는 **00 01 10 11**이 있는 것.

int로 key를 표현하니 실행속도가 눈에 띄게 빨라졌다.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

using namespace std;

#define CLOCK_NUM 16

unordered_map<int, int> clockState;
vector<int> queries;

void input()
{
    int count;
    cin >> count;

    for (int i = 0; i < count; i++)
    {
        int temp;
        int key = 0;
        for (int j = 0; j < CLOCK_NUM; j++)
        {
            cin >> temp;
            key = key | ((temp == 12 ? 0 : 4 - temp / 3) << j * 2);
        }

        queries.push_back(key);
    }
}

void process()
{
    for (int a = 0; a < 4; a++)
        for (int b = 0; b < 4; b++)
            for (int c = 0; c < 4; c++)
                for (int d = 0; d < 4; d++)
                    for (int e = 0; e < 4; e++)
                        for (int f = 0; f < 4; f++)
                            for (int g = 0; g < 4; g++)
                                for (int h = 0; h < 4; h++)
                                    for (int i = 0; i < 4; i++)
                                        for (int j = 0; j < 4; j++)
    {
        int _0 = (a+d+f) % 4;
        int _1 = (a+i) % 4;
        int _2 = (a+i+f) % 4 ;
        int _3 = (b+i+g+j) % 4 ;
        int _4 = (c+d+i+h+j) % 4 ;
        int _5 = (d+i+h+j) % 4 ;
        int _6 = (d+e) % 4 ;
        int _7 = (b+d+e+h) % 4 ;
        int _8 = (e) % 4 ;
        int _9 = (b+j) % 4 ;
        int _10 = (c+e) % 4 ;
        int _11 = (b) % 4 ;
        int _12 = (e) % 4 ;
        int _13 = (j) % 4 ;
        int _14 = (c+f+g+h) % 4 ;
        int _15 = (c+f+g+h) % 4 ;

        int key = (_0 << 0) | (_1 << 2) | (_2 << 4) | (_3 << 6)
                | (_4 << 8) | (_5 << 10) | (_6 << 12) | (_7 << 14)
                | (_8 << 16) | (_9 << 18) | (_10 << 20) | (_11 << 22)
                | (_12 << 24) | (_13 << 26) | (_14 << 28) | (_15 << 30);
        
        int count = (a + b + c + d + e + f + g + h + i + j);
        
        if (clockState[key] == 0)
            clockState[key] = count;
        else
            clockState[key] = min(clockState[key], count);
    }
}

void output()
{
    for (auto s : queries)
    {
        if (clockState.find(s) == clockState.end())
            cout << "-1 ";
        else
            cout << clockState[s] << " ";
    }
}


int main()
{
    input();
    process();
    output();
}

```