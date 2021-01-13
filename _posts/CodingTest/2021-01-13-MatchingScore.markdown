---
layout: post
title:  "매칭 점수 (Cpp)"
date:   2021-01-13 10:40:00 +0900
categories: CodingTest
tags: [codingtest, cpp]
---
## 매칭 점수

[https://programmers.co.kr/learn/courses/30/lessons/42893](https://programmers.co.kr/learn/courses/30/lessons/42893) 

아직 푸는 중. 현재 점수 50점.
더 깔끔한 코드로 Update 예정
Regex에 의해 계산되는 'basicScore'에서 예외 케이스들을 전부 못 잡는듯.

```cpp

#include <iostream>
#include <regex>
#include <string>
#include <vector>
#include <unordered_map>

using namespace std;

namespace MatchingScore
{
    class PageUrl
    {
    public:
        string url;
        PageUrl(string Url)
            :url(Url) {};
        PageUrl() {};

        bool operator<(const PageUrl& rhs) const
        {
            return url < rhs.url;
        }
    };

    class Page;
    unordered_map<string, Page*> pagePool;

    class Page
    {
    private:

        Page* findPageByURL(PageUrl url)
        {
            auto it = pagePool.find(url.url);
            if (it != pagePool.end())
                return it->second;
            return nullptr;
        }

        int calcBasicScore(const string& word, const string& html)
        {
            //대소문자 구분 x
            //알파벳을 제외한 문자는 모두 다 '빈칸'으로 취급
            //aba -> (abab, abababa) X
            //aba -> (aba@aba) O : 2개 (aba) O : 1개
            //Regex : \b[Bb][Ll][Ii][Nn][Dd]\b ([]안에는 word의 각 글자가 들어감)
            
            string regex = "[^A-Za-z]";
            for (int i = 0; i < word.size(); i++)
            {
                if (word[i] < 'a')
                    regex += std::string() + '[' + word[i] + (char)(word[i] + 'a' - 'A') + ']';
                else
                    regex += std::string() + '[' + (char)(word[i] + 'A' - 'a') + word[i] + ']';
            }
            regex += "[^A-Za-z]";

            std::regex re(regex);
            std::smatch match;
            string copy = string(html);
            int count = 0;
            
            while (std::regex_search(copy, match, re)) {
                count++;
                copy = match.suffix(); //suffix를 따로 해줘야한다니.. 주여
            }
            
            return count;
        }

        PageUrl getMyUrl(const string& html)
        {
            //<meta property="og:url" content="https://c.com"/>
            //정규표현식 쓰기
            //Regex : <meta property="og\:url" content=".*"\/>
            
            std::regex re("<meta property=\"og\:url\" content=\".*\"\/>");
            std::smatch match;
            string copy = string(html);

            if (std::regex_search(copy, match, re))
            {
                string url = match.str();
                url = url.substr(33, url.size());
                url = url.substr(0, url.find("\""));
                return PageUrl(url);
            }
            else
            {
                cout << "Invalid html Error" << endl;
                return PageUrl();
            }
        }
        vector<PageUrl> getExternalLinks(const string& html)
        {
            //<a href="https://careers.kakao.com/index">
            //href 찾으면 됨.
            //Regex : href=".*"
            vector<PageUrl> links;
 
            std::regex re("href=\".*\"");
            std::smatch match;
            string copy = string(html);

            while (std::regex_search(copy, match, re))
            {
                string url = match.str();
                url = url.substr(6, url.size());
                url = url.substr(0, url.find("\""));

                //cout << url << endl;
                links.push_back(PageUrl(url));
                copy = match.suffix();
            }
            return links;
        }

        float getLinkScore()
        {
            return (float)basicScore / externalLink.size();
        }

    public:
        int basicScore;
        PageUrl url;
        vector<PageUrl> externalLink; //ToDo : Make this Set
        vector<PageUrl> referencePages; //ToDo : Make this Set

        Page(const string& word, const string& html)
        {
            basicScore = calcBasicScore(word, html);
            url = getMyUrl(html);
            externalLink = getExternalLinks(html);
            
            pagePool.insert({ url.url, this }); //? 왜 url.url을 전달해야해? 생성자를 불러야해서? 복사생성자 정의해도 url.url로 해야하던데..
        }

        void addMeToReference()
        {
            for (int i = 0; i < externalLink.size(); i++)
            {
                auto p = findPageByURL(externalLink[i]);
                if(p != nullptr)
                    p->referencePages.push_back(url);
            }
        }

        float getMatchingScore()
        {
            float sum = 0;
            for (int i = 0; i < referencePages.size(); i++)
            {
                Page* page = findPageByURL(referencePages[i]); //바꿔야함. '내가 가르키는' 페이지가 아니라 '나를 가르키는' 페이지의 값을 계산해야함.
                if(page != nullptr)
                    sum += (float)page->basicScore / page->referencePages.size();
            }
            sum += basicScore;
            return sum;
        }
    };

    int solution(string word, vector<string> htmls) {
        int answer = 0;

        //1. init
        vector<Page> pages;
        for (int i = 0; i < htmls.size(); i++)
        {
            pages.push_back(Page(word, htmls[i]));
        }

        //2. Calc reference of each other.
        for (int i = 0; i < pages.size(); i++)
        {
            pages[i].addMeToReference();
        }

        //2. find Maximum
        for (int i = 1; i < pages.size(); i++)
        {
            if (pages[i].getMatchingScore() > pages[answer].getMatchingScore())
            {
                answer = i;
            }
        }
        return answer;
    }
    
}
```