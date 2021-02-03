---
layout: post
title:  "여행 경로 (Cpp)"
date:   2021-02-03 14:00:00 +0900
categories: CodingTest
tags: [codingtest, cpp, dfs]
---
## 여행 경로

문제 링크 : [https://programmers.co.kr/learn/courses/30/lessons/43164](https://programmers.co.kr/learn/courses/30/lessons/43164) 

![01](/assets/images/CodingTests/2021-02-03-TravelingPath/01.png)

BFS/DFS에 해당하는 문제였고, DFS 방식이었다.

보통 BFS/DFS 문제에서 BFS와 DFS중 어떤 것을 사용해야하는지 전략은 다음과 같다.

**BFS**
1. 최단 거리 탐색
   
**DFS**
1. 조건 탐색
2. Articulation Point 탐색 (특이한 경우)

이 문제일 경우 조건 탐색에 더 부합해서 DFS를 썻다.  
문제의 주요 포인트는 다음과 같다.

1. 항상 "ICN" 공항에서 시작한다.
2. 같은 티켓이 여러개 있을 수 있다.
3. 가능한 경로가 2개 이상이면 '알파벳 순서가 앞서는 경로'를 선택한다.
4. 주어진 항공권을 모두 사용해야한다.

문제를 다 풀고 1번 조건을 뒤늦게 확인해서 해맸다... 1번 조건이 적용되면 문제가 훨씬 간단해진다.  
4번 조건이 조금 까다로운데, 나 같은 경우 dfs로 답을 찾을 때 존재하는 항공권의 **index**를 선택하는 형식으로 짜서 해결했다. 즉, 각각의 항공권의 index는 고유하기 때문에 똑같은 티켓이 여러 개여도, 주어진 항공권을 모두 사용하는 조건도 둘 다 잡을 수 있다.  
다만 이렇게 index를 뽑는 경우 3번 조건을 만족시키는게 까다롭다, 여러 path가 가능한 답안이 되면, **이를 일일히 실제 string과 비교해서 alphabet 순으로 앞인 정답을 뽑아야한다**.  
또한 **내 답은 graph를 구성하지 않고**, **현재 출발지에서 가능한 도착지를 매 dfs마다 다시 계산**하므로 속도가 느리다.

개인적으로 내 답이 마음에 들지 않아서, 확인했던 답 중 가장 마음에 들었던 답을 같이 포스팅 한다.


### 내 답
```cpp
#include <string>
#include <vector>
#include <map>
#include <algorithm>

using namespace std;

vector<vector<int>> pathes;

vector<int> availableTickets(string airport, const vector<vector<string>>& tickets)
{
    vector<int> availables;
    for (int i = 0; i < tickets.size(); i++)
    {
        if (tickets[i][0] == airport)
        {
            availables.push_back(i);
        }
    }
    return availables;
}
void dfs(string airport, vector<int> sol, const vector<vector<string>>& tickets)
{
    if (sol.size() == tickets.size())
    {
        pathes.push_back(sol);
        return;
    }

    vector<int> ticket_use = availableTickets(airport, tickets);
    for (int i = 0; i < ticket_use.size(); i++)
    {
        if (find(sol.begin(), sol.end(), ticket_use[i]) == sol.end())
        {
            sol.push_back(ticket_use[i]);
            dfs(tickets[ticket_use[i]][1], sol, tickets);
            sol.pop_back();
        }
    }
}
vector<string> toVectorString(vector<int> answer, const vector<vector<string>>& tickets)
{
    vector<string> vec;
    vec.push_back(tickets[answer[0]][0]);
    vec.push_back(tickets[answer[0]][1]);

    for (int i = 1; i < answer.size(); i++)
    {
        vec.push_back(tickets[answer[i]][1]);
    }
    return vec;
}

vector<string> solution(vector<vector<string>> tickets)
{
    vector<int> sol;
    dfs("ICN", sol, tickets);
    
    sort(pathes.begin(), pathes.end(), [&](vector<int> a, vector<int> b) {
            for (int i = 0; i < a.size(); i++)
            {
                if (tickets[a[i]][1] == tickets[b[i]][1])
                    continue;
                return tickets[a[i]][1] < tickets[b[i]][1];
            }
            return false;
        });
    vector<string> answer = toVectorString(pathes.front(), tickets);
    return answer;
}
```

### 다른 분 답
[https://programmers.co.kr/questions/11358](https://programmers.co.kr/questions/11358)

map에 pair를 넣을 때 **"{itemA, itemB}"** 형태로 넣는게 너무 마음에 들었다. cpp로도 직관적인 코드작성이 가능하다는 걸 보여주는 느낌. 덕분에 진짜 ticet의 형태처럼 **"{출발지, 도착지}"** 처럼 표현이 되니 한눈에 알아보기 편했다.

```cpp
#include <string>
#include <vector>
#include <map>
#include <algorithm>

using namespace std;

vector<string> answer;
map<string,vector<string>> check;
map<pair<string,string>, int> visited;
int N;

void DFS(string cur){
    answer.push_back(cur);
    if((int)answer.size() == N+1)
        return;

    for(int i=0;i<(int)check[cur].size();i++){
        string next = check[cur][i];
        /* 남은 티켓 없으면 */
        if(visited[{cur,next}] == 0)
            continue;

        visited[{cur,next}]--;
        DFS(next);
        if((int)answer.size() == N+1)
            return;
        visited[{cur,next}]++;
    }
    answer.pop_back();
}

vector<string> solution(vector<vector<string>> tickets) {
    N = (int)tickets.size();

    /* 그래프 만들기 */
    for(int i=0;i<(int)tickets.size();i++){
        vector<string> temp;
        string from = tickets[i][0];
        string to = tickets[i][1];

        if(check.find(from) == check.end())
            check.insert(make_pair(from, temp));
        check[from].push_back(to);
        visited[{from,to}]++;
    }

    /* 알파벳 순서로 정렬 */
    for(auto iter = check.begin(); iter != check.end(); iter++)
        sort(iter->second.begin(), iter->second.end());

    DFS("ICN");

    return answer;
}
```