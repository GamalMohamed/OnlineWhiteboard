﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace OnlineWhiteBoard
{
    public static class Extensions
    {
        public static string String(this Random random, int length)
        {
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new String(
                Enumerable.Repeat(chars, length)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
        }

        public static T ReadFromRequest<T>(this Controller controller)
        {
            using (StreamReader reader = new StreamReader(controller.Request.InputStream))
            {
                string request = reader.ReadToEnd();

                return new JavaScriptSerializer().Deserialize<T>(request);
            }
        }

        public static bool Remove<T>(this List<T> list, Predicate<T> predicate)
        {
            int index = list.FindIndex(predicate);

            if (index >= 0)
            {
                list.RemoveAt(index);
                return true;
            }

            return false;
        }

        public static int NextInt(this Random random, int max)
        {
            double number = random.NextDouble();

            return (int)Math.Round(number * max);
        }

        public static T TakeRandom<T>(this List<T> list)
        {
            Random random = new Random();

            int randomIndex = random.NextInt(list.Count - 1);

            return list[randomIndex];
        }

        public static string ToRgbString(this Color color)
        {
            return "#" + color.R.ToString("x2") + color.G.ToString("x2") + color.B.ToString("x2");
        }
    }
}